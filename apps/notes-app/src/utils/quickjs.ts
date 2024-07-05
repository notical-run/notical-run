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

export type VMEnvOptions = {
  pos: number;
};

const variant = newVariant(RELEASE_SYNC, { wasmLocation });

let quickJS: Promise<QuickJSWASMModule> | undefined;
export async function getQuickJS() {
  if (quickJS) return quickJS;
  quickJS = newQuickJSWASMModuleFromVariant(variant);
  return quickJS;
}

const stateStore: Record<string, Signal<any>> = {};

let quickRuntime: QuickJSRuntime | undefined;
let quickVM: QuickJSContext | undefined;

export const getQuickVM = async (options?: VMEnvOptions) => {
  const quickJS = await getQuickJS();
  if (!quickJS) {
    throw new Error('No quickjs buddy');
  }

  const internalsKey = '_internals';
  const debugKey = 'debug';
  const stateKey = 'state';

  if (!quickVM) {
    quickRuntime = quickJS.newRuntime();
    quickRuntime.setModuleLoader((_modulePath: string) => {
      throw new Error('TODO: Import not implemented yet');
    });
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

  const proxyState = new Proxy({}, {
    get(target, key) {
      if (key === 'toJSON') return target;
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

  Scope.withScope(scope => {
    if (!quickVM) return;

    const internals = scope.manage(getInternal()!);
    const debug = scope.manage(getDebug()!);

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
        return Scope.withScope(scope => {
          if (!quickVM) return;
          const key = quickVM.dump(scope.manage(keyH));
          const [getState] = getSignal(key);
          const val = getState();
          const result = quickVM.evalCode(JSON.stringify(val) ?? 'null');
          return quickVM?.unwrapResult(result);
        });
      })
      .consume(getStateHandle => {
        quickVM!.setProp(internals, 'getState', getStateHandle);
      });

    // Node Position
    const posHandle =
      typeof options?.pos === 'number'
        ? scope.manage(quickVM.newNumber(options?.pos))
        : quickVM.undefined;
    quickVM.setProp(internals, 'nodePos', posHandle);

    quickVM
      .newFunction('below', () => {
        return Scope.withScope(scope => {
          if (!quickVM) return;
          const internal = scope.manage(getInternal()!);
          const nodePosHandle = quickVM.getProp(internal, 'nodePos');
          const nodePos = quickVM.dump(nodePosHandle);
          return quickVM.newNumber((nodePos ?? 0) + 1);
        });
      })
      .consume(getBelowHandle => {
        quickVM!.setProp(quickVM!.global, 'below', getBelowHandle);
      });

    quickVM
      .newFunction('debugLog', (...args) => {
        return Scope.withScope(scope => {
          if (!quickVM) return;
          const argsVal = args.map(arg => quickVM!.dump(scope.manage(arg)));
          console.log('[vm]', ...argsVal);
        });
      })
      .consume(getBelowHandle => {
        quickVM!.setProp(debug, 'log', getBelowHandle);
      });
  });

  return quickVM;
};
