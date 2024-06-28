import type { QuickJSContext } from 'quickjs-emscripten-core';
import {
  QuickJSWASMModule,
  newQuickJSWASMModuleFromVariant,
  newVariant,
  RELEASE_SYNC,
} from 'quickjs-emscripten';
import wasmLocation from '@jitl/quickjs-wasmfile-release-sync/wasm?url';
import { createSignal, type Signal } from 'solid-js';

const variant = newVariant(RELEASE_SYNC, { wasmLocation });

let quickJS: Promise<QuickJSWASMModule> | undefined;
export async function getQuickJS() {
  if (quickJS) return quickJS;
  quickJS = newQuickJSWASMModuleFromVariant(variant);
  return quickJS;
}

const stateStore: Record<string, Signal<any>> = {};

let quickVM: QuickJSContext | undefined;

export const getQuickVM = async () => {
  const quickJS = await getQuickJS();
  if (!quickJS) {
    throw new Error('No quickjs buddy');
  }

  if (!quickVM) {
    quickVM = quickJS.newContext();

    quickVM
      .unwrapResult(
        quickVM.evalCode(
          `(() => {
  globalThis.state = new Proxy({}, {
    get(target, key) {
      if (key === 'toJSON') return target;
      return getState(key);
    },
    set(target, key, value) {
      setState(key, value);
      target[key] = value;
      return value;
    },
  })
})()`,
        ),
      )
      .dispose();
  }

  const setStateHandle = quickVM.newFunction('setState', (keyH, valH) => {
    const key = quickVM?.dump(keyH);
    const val = quickVM?.dump(valH);
    if (!stateStore[key]) {
      stateStore[key] = createSignal(val);
    } else {
      stateStore[key][1](val);
    }
    keyH.dispose();
    valH.dispose();
  });
  quickVM.setProp(quickVM.global, 'setState', setStateHandle);
  setStateHandle.dispose();

  const getStateHandle = quickVM.newFunction('getState', keyH => {
    if (!quickVM) return;
    const key = quickVM?.dump(keyH);
    if (!stateStore[key]) {
      stateStore[key] = createSignal(undefined);
    }
    const val = stateStore[key][0]();
    const result = quickVM?.evalCode(JSON.stringify(val) ?? 'null');
    return quickVM?.unwrapResult(result);
  });
  quickVM.setProp(quickVM.global, 'getState', getStateHandle);
  getStateHandle.dispose();

  return quickVM;
};
