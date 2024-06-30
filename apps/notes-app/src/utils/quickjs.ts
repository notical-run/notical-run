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
  Object.defineProperty(globalThis, '${internalsKey}', {
    value: {},
    writable: false,
  });

  const proxyState = new Proxy({}, {
    get(target, key) {
      if (key === 'toJSON') return target;
      return ${internalsKey}.getState(key);
    },
    set(target, key, value) {
      ${internalsKey}.setState(key, value);
      target[key] = value;
      return value;
    },
  });
  Object.defineProperty(globalThis, '${stateKey}', {
    value: proxyState,
    writable: false,
  });
})();`,
        ),
      )
      .dispose();
  }

  const getInternal = () =>
    quickVM && quickVM.getProp(quickVM.global, internalsKey);

  Scope.withScope(scope => {
    if (!quickVM) return;

    const internals = scope.manage(getInternal()!);

    const setStateHandle = scope.manage(
      quickVM.newFunction('setState', (keyH, valH) => {
        const key = quickVM?.dump(keyH);
        const val = quickVM?.dump(valH);
        if (!stateStore[key]) {
          stateStore[key] = createSignal(val);
        } else {
          stateStore[key][1](val);
        }
        keyH.dispose();
        valH.dispose();
      }),
    );
    quickVM.setProp(internals, 'setState', setStateHandle);

    const getStateHandle = scope.manage(
      quickVM.newFunction('getState', keyH => {
        if (!quickVM) return;
        const key = quickVM?.dump(keyH);
        if (!stateStore[key]) {
          stateStore[key] = createSignal(undefined);
        }
        const val = stateStore[key][0]();
        const result = quickVM?.evalCode(JSON.stringify(val) ?? 'null');
        return quickVM?.unwrapResult(result);
      }),
    );
    quickVM.setProp(internals, 'getState', getStateHandle);

    // Node Position
    const posHandle =
      options?.pos !== undefined
        ? scope.manage(quickVM.newNumber(options?.pos))
        : quickVM.undefined;
    quickVM.setProp(internals, 'nodePos', posHandle);

    const getPosUnder = quickVM.newFunction('below', () => {
      return Scope.withScope(scope => {
        if (!quickVM) return;
        const internal = scope.manage(getInternal()!);
        const nodePosHandle = quickVM.getProp(internal, 'nodePos');
        const nodePos = quickVM.dump(nodePosHandle);
        return quickVM.newNumber((nodePos ?? 0) + 1);
      });
    });
    quickVM.setProp(quickVM.global, 'below', getPosUnder);
  });

  return quickVM;
};
