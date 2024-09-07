import { toQuickJSHandle, fromQuickJSHandle } from '@/engine/quickjs';
import { QuickJSBridge } from '@/engine/quickjs/types';
import { Maybe } from '@/utils/maybe';
import { QuickJSHandle } from 'quickjs-emscripten-core';

export const fromFunctionHandle = <T>(bridge: QuickJSBridge, handle: QuickJSHandle): Maybe<T> => {
  const { quickVM } = bridge;
  if (quickVM.typeof(handle) !== 'function') return Maybe.Nothing();

  const fnHandle = handle.consume(f => f.dup()); // Create a copy to keep it alive inside closure
  function func(this: any, ...fnArgs: any[]) {
    const fnArgsHandles = fnArgs.map(arg => toQuickJSHandle(quickVM, arg));
    const ctx = toQuickJSHandle(quickVM, this);
    const res = quickVM.callFunction(fnHandle, ctx, ...fnArgsHandles);
    return fromQuickJSHandle(quickVM, quickVM.unwrapResult(res));
  }
  (func as any).displayName = quickVM.getProp(fnHandle, 'displayName').consume(quickVM.dump);
  return Maybe.Just(func as T);
};
