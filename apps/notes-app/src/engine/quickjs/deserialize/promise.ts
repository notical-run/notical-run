import { QuickJSBridge } from '@/engine/quickjs/types';
import { Maybe } from '@/utils/maybe';
import { QuickJSHandle } from 'quickjs-emscripten-core';

export const fromPromiseHandle = <T>(bridge: QuickJSBridge, handle: QuickJSHandle): Maybe<T> => {
  const { quickVM } = bridge;
  const promiseState: any = quickVM.getPromiseState(handle);
  if (promiseState.notAPromise) return Maybe.Nothing();

  const promise = handle.consume(quickVM.resolvePromise);
  return Maybe.Just(promise.then(res => quickVM.unwrapResult(res)) as T);
};
