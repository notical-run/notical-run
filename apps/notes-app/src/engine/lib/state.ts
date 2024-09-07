import { Scope } from 'quickjs-emscripten-core';
import { getInternalsHandle, INTERNALS_KEY } from '@/engine/internals';
import { EvalEngineContextOptions } from '@/engine/types';
import { createSignal } from 'solid-js';
import { QuickJSBridge } from '@/engine/quickjs/types';

export const registerStateLib = async (
  bridge: QuickJSBridge,
  options: EvalEngineContextOptions,
) => {
  const { quickVM } = bridge;
  quickVM
    .unwrapResult(
      await quickVM.evalCodeAsync(`{
  const proxyState = new Proxy({ __native__: 'state' }, {
    get(target, key) {
      if (key === '__native__') return target.__native__;
      return ${INTERNALS_KEY}.getState(key);
    },
    set(target, key, value) {
      ${INTERNALS_KEY}.setState(key, value);
      target[key] = value;
      return true;
    },
  });
  Object.defineProperty(globalThis, 'state', { value: proxyState, writable: false });
}`),
    )
    .dispose();

  return Scope.withScope(scope => {
    const internals = scope.manage(getInternalsHandle(quickVM));

    const getSignal = (key: string) => {
      if (!options.stateStore.has(key)) {
        options.stateStore.set(key, createSignal(undefined));
      }
      return options.stateStore.get(key)!;
    };

    bridge
      .toHandle((key: string, val: any) => {
        const [_, setState] = getSignal(key);
        setState(val);
      })
      .consume(f => quickVM!.setProp(internals, 'setState', f));

    bridge
      .toHandle((key: string) => {
        const [getState] = getSignal(key);
        return getState();
      })
      .consume(f => quickVM!.setProp(internals, 'getState', f));
  });
};
