import { QuickJSContextOptions } from '@/engine/types';
import { QuickJSAsyncContext } from 'quickjs-emscripten-core';

export const registerGlobalProxy = async (
  quickVM: QuickJSAsyncContext,
  _options: QuickJSContextOptions,
) => {
  quickVM
    .unwrapResult(
      await quickVM.evalCodeAsync(`{
globalThis.__native__ = 'globalThis';
globalThis.global = globalThis;

const globalThisProxy = new Proxy(globalThis, {
  get(target, prop, receiver) {
    return Reflect.get(state, prop, receiver);
  },
  set(target, prop, value, receiver) {
    return Reflect.set(state, prop, value, receiver);
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
