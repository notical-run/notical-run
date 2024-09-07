import { QuickJSBridge } from '@/engine/quickjs/types';
import { EvalEngineContextOptions } from '@/engine/types';

export const registerGlobalProxy = async (
  bridge: QuickJSBridge,
  _options: EvalEngineContextOptions,
) => {
  const { quickVM } = bridge;

  quickVM
    .unwrapResult(
      await quickVM.evalCodeAsync(`{
globalThis.__native__ = 'globalThis';
globalThis.global = globalThis;
Object.defineProperty(globalThis, 'globalThis', { value: globalThis, writable: false });
Object.defineProperty(globalThis, 'toJSON', { value: () => ({ __native__: 'globalThis' }) });

// Static values (no signal)
const globalDefinedValues = {};

const globalThisProxy = new Proxy(globalThis, {
  get(target, prop, receiver) {
    if (globalDefinedValues[prop]) return globalDefinedValues[prop];
    return Reflect.get(state, prop, receiver);
  },
  set(target, prop, value, receiver) {
    if (typeof value === 'function') {
      globalDefinedValues[prop] = value;
      return value;
    } else {
      return Reflect.set(state, prop, value, receiver);
    }
  }
});

Object.getOwnPropertyNames(globalThis).forEach(prop => {
  if (prop !== 'global') {
    Object.defineProperty(globalThisProxy, prop, Object.getOwnPropertyDescriptor(globalThis, prop));
  }
});

globalThis.__proto__ = globalThisProxy;
}`),
    )
    .dispose();
};
