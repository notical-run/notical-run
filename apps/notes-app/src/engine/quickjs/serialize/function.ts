import { QuickJSHandle } from 'quickjs-emscripten-core';
import { callFunctionCode } from '@/engine/quickjs/utils';
import { QuickJSBridge } from '@/engine/quickjs/types';
import { Maybe } from '@/utils/maybe';

export const toFunctionHandle = (
  bridge: QuickJSBridge,
  fn: (...a: any[]) => any,
): Maybe<QuickJSHandle> => {
  if (typeof fn !== 'function') return Maybe.Nothing();

  const { quickVM } = bridge;

  const toInternalFunction = (fnHandle: QuickJSHandle) => {
    const exposedFnCode = `oldFn => {
const fn = function(...args) { return oldFn.call(this, ...args); };
fn.name = oldFn.name;
fn.length = oldFn.length;
return fn;
}`;
    return fnHandle.consume(f => callFunctionCode(quickVM, exposedFnCode, quickVM.undefined, f));
  };

  // Async functions
  if (fn instanceof (async () => {}).constructor) {
    const fnH = quickVM.newAsyncifiedFunction(fn.name, async function (...args) {
      const argsVal = args.map(a => bridge.fromHandle(a));
      const ctx = bridge.fromHandle(this);
      return bridge.toHandle(await fn.call(ctx, ...argsVal));
    });

    return Maybe.Just(fnH);
  }

  const fnH = toInternalFunction(
    quickVM.newFunction(fn.name, function (...args) {
      const argsVal = args.map(a => bridge.fromHandle(a));
      const ctx = bridge.fromHandle(this);
      return bridge.toHandle(fn.call(ctx, ...argsVal));
    }),
  );

  return Maybe.Just(fnH);
};
