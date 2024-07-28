import { getQuickJSRuntime } from '@/engine/quickjs';
import { QuickJSContextOptions } from '@/engine/types';
import { findNodeById } from '@/utils/editor';
import { Scope } from 'quickjs-emscripten-core';
import { createSignal } from 'solid-js';

export const createQuickJSContext = async (options: QuickJSContextOptions) => {
  const internalsKey = '_internals';
  const debugKey = 'debug';
  const stateKey = 'state';
  const showKey = 'show';
  const insertKey = 'insert';

  const quickRuntime = await getQuickJSRuntime();
  quickRuntime.setModuleLoader(async (modulePath, ctx) => {
    try {
      const code = await options.moduleLoader(modulePath);
      return { value: code };
    } catch (e) {
      const err = (e as any)?.message ? ctx.newError((e as any).message) : e;
      return { error: err as Error };
    }
  });
  quickRuntime.setMaxStackSize(10_000);
  quickRuntime.setMemoryLimit(1_000_000);
  const quickVM = quickRuntime.newContext({
    ownedLifetimes: [quickRuntime],
  });
  quickRuntime.context = quickVM;

  quickVM
    .unwrapResult(
      await quickVM.evalCodeAsync(
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

  const getInternal = () => quickVM && quickVM.getProp(quickVM.global, internalsKey);

  const getDebug = () => quickVM && quickVM.getProp(quickVM.global, debugKey);

  const getShow = () => quickVM && quickVM.getProp(quickVM.global, showKey);

  const getInsert = () => quickVM && quickVM.getProp(quickVM.global, insertKey);

  Scope.withScope(scope => {
    if (!quickVM) return;

    const internals = scope.manage(getInternal()!);
    const debug = scope.manage(getDebug()!);
    const show = scope.manage(getShow()!);
    const insert = scope.manage(getInsert()!);

    const getSignal = (key: string) => {
      if (!options.stateStore.has(key)) {
        options.stateStore.set(key, createSignal(undefined));
      }
      return options.stateStore.get(key)!;
    };

    quickVM
      .newFunction('_internalsSetState', (keyH, valH) => {
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
        const result = quickVM.evalCode(`(${JSON.stringify(val ?? null) ?? 'null'})`);
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
      .newFunction('_show', (hookH, textH) => {
        const hook = hookH?.consume(quickVM!.dump);
        const text = textH?.consume(quickVM!.dump);

        if (!hook || typeof hook.pos !== 'number')
          throw new Error('Invalid target given to show.below');

        options.withEditor(editor => {
          const nodePosAndSize = findNodeById(editor, hook.id);
          if (!nodePosAndSize) return;
          const tr = editor.state.tr;
          tr.setNodeAttribute(nodePosAndSize.pos, 'anchoredContent', text);
          editor.view.dispatch(tr.setMeta('addToHistory', false));
        });
      })
      .consume(showMarkdownBelowHandle => {
        quickVM!.setProp(show, 'below', showMarkdownBelowHandle);
      });

    quickVM
      .newFunction('_listenToUpdate', () => {
        options.contentUpdateSignal[0]();
      })
      .consume(insertMarkdownBelowHandle => {
        quickVM!.setProp(internals, 'listenToUpdate', insertMarkdownBelowHandle);
      });

    quickVM
      .newFunction('_debugLog', (...args) => {
        const argsVal = args.map(arg => arg.consume(quickVM!.dump));
        console.log('[vm]', ...argsVal);
      })
      .consume(getBelowHandle => {
        quickVM!.setProp(debug, 'log', getBelowHandle);
      });
  });

  return quickVM;
};
