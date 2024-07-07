import type { QuickJSContext, QuickJSRuntime } from 'quickjs-emscripten-core';
import {
  QuickJSWASMModule,
  newQuickJSWASMModuleFromVariant,
  newVariant,
  RELEASE_SYNC,
  Scope,
} from 'quickjs-emscripten';
import wasmLocation from '@jitl/quickjs-wasmfile-release-sync/wasm?url';
import { createSignal, type Signal } from 'solid-js';
import { Editor } from '@tiptap/core';

export type VMEnvOptions = {
  id: string;
  pos: number;
  nodeSize: number;
  withEditor: <R>(fn: (editor: Editor) => R) => R;
};

const variant = newVariant(RELEASE_SYNC, { wasmLocation });

let quickJS: Promise<QuickJSWASMModule> | undefined;
export async function getQuickJS() {
  if (quickJS) return quickJS;
  quickJS = newQuickJSWASMModuleFromVariant(variant);
  return quickJS;
}

const stateStore: Record<string, Signal<any>> = {};

const contentUpdateSignal = createSignal(false);
export const onContentUpdate = () => contentUpdateSignal[1](b => !b);

let quickRuntime: QuickJSRuntime | undefined;
let quickVM: QuickJSContext | undefined;

export const getQuickVM = async (options: VMEnvOptions) => {
  const quickJS = await getQuickJS();
  if (!quickJS) {
    throw new Error('No quickjs buddy');
  }

  const internalsKey = '_internals';
  const debugKey = 'debug';
  const stateKey = 'state';
  const showKey = 'show';
  const insertKey = 'insert';

  if (!quickVM) {
    quickRuntime = quickJS.newRuntime();
    quickRuntime.setModuleLoader((_modulePath: string) => {
      throw new Error('TODO: Import not implemented yet');
    });
    quickRuntime.setMaxStackSize(10000);
    quickRuntime.setMemoryLimit(1_000_000);
    quickVM = quickRuntime.newContext({
      ownedLifetimes: [quickRuntime],
    });
    quickRuntime.context = quickVM;

    quickVM
      .unwrapResult(
        quickVM.evalCode(
          `;(() => {
  Object.defineProperty(globalThis, '${internalsKey}', { value: {}, writable: false });
  Object.defineProperty(globalThis, '${debugKey}', { value: {}, writable: false });
  Object.defineProperty(globalThis, '${showKey}', { value: {}, writable: false });
  Object.defineProperty(globalThis, '${insertKey}', { value: {}, writable: false });

  const proxyState = new Proxy({ __native__: 'state' }, {
    get(target, key) {
      if (key === '__native__') return target.__native__;
      return ${internalsKey}.getState(key);
    },
    set(target, key, value) {
      ${internalsKey}.setState(key, value);
      target[key] = value;
      return true;
    },
  });
  Object.defineProperty(globalThis, '${stateKey}', { value: proxyState, writable: false });
})();`,
        ),
      )
      .dispose();
  }

  const getInternal = () =>
    quickVM && quickVM.getProp(quickVM.global, internalsKey);

  const getDebug = () => quickVM && quickVM.getProp(quickVM.global, debugKey);

  // const getShow = () => quickVM && quickVM.getProp(quickVM.global, showKey);

  const getInsert = () => quickVM && quickVM.getProp(quickVM.global, insertKey);

  Scope.withScope(scope => {
    if (!quickVM) return;

    const internals = scope.manage(getInternal()!);
    const debug = scope.manage(getDebug()!);
    // const show = scope.manage(getShow()!);
    const insert = scope.manage(getInsert()!);

    const getSignal = (key: string) => {
      if (!stateStore[key]) {
        stateStore[key] = createSignal(undefined);
      }
      return stateStore[key];
    };

    quickVM
      .newFunction('_internalSetState', (keyH, valH) => {
        return Scope.withScope(scope => {
          if (!quickVM) return;
          const key = quickVM.dump(scope.manage(keyH));
          const val = quickVM.dump(scope.manage(valH));
          const [_, setState] = getSignal(key);
          setState(val);
        });
      })
      .consume(setStateHandle => {
        quickVM!.setProp(internals, 'setState', setStateHandle);
      });

    quickVM
      .newFunction('_internalGetState', keyH => {
        if (!quickVM) return;
        const key = keyH.consume(quickVM.dump);
        const [getState] = getSignal(key);
        const val = getState();
        const result = quickVM.evalCode(
          `(${JSON.stringify(val ?? null) ?? 'null'})`,
        );
        return quickVM?.unwrapResult(result);
      })
      .consume(getStateHandle => {
        quickVM!.setProp(internals, 'getState', getStateHandle);
      });

    quickVM
      .newFunction('_insertBelow', (hookH, textH) => {
        const hook = hookH?.consume(quickVM!.dump);
        const text = textH?.consume(quickVM!.dump);

        if (!hook || typeof hook.pos !== 'number')
          throw new Error('Invalid target given to insert.below');

        options.withEditor(editor => {
          editor.commands.insertContentAt(hook.pos + hook.nodeSize + 1, text);
        });
      })
      .consume(insertMarkdownBelowHandle => {
        quickVM!.setProp(insert, 'below', insertMarkdownBelowHandle);
      });

    quickVM
      .newFunction('_listenToUpdate', () => {
        contentUpdateSignal[0]();
      })
      .consume(insertMarkdownBelowHandle => {
        quickVM!.setProp(
          internals,
          'listenToUpdate',
          insertMarkdownBelowHandle,
        );
      });

    quickVM
      .newFunction('debugLog', (...args) => {
        const argsVal = args.map(arg => arg.consume(quickVM!.dump));
        console.log('[vm]', ...argsVal);
      })
      .consume(getBelowHandle => {
        quickVM!.setProp(debug, 'log', getBelowHandle);
      });
  });

  return quickVM;
};
