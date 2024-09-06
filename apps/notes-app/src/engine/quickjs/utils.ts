import { QuickJSAsyncContext, QuickJSHandle } from 'quickjs-emscripten-core';

export const asAsync =
  (fn: (...a: any[]) => any) =>
  (...args: any[]) =>
    fn(...args);

export const getQJSPropPath = (
  quickVM: QuickJSAsyncContext,
  path: string[],
  obj: QuickJSHandle = quickVM.global,
) => path.reduce((result, key) => quickVM.getProp(result, key), obj);

export const callFunction = (
  quickVM: QuickJSAsyncContext,
  fnH: QuickJSHandle,
  ctx: QuickJSHandle | null | undefined,
  ...args: QuickJSHandle[]
): QuickJSHandle => {
  const result = fnH.consume(f => quickVM.callFunction(f, ctx ?? quickVM.undefined, ...args));
  return quickVM.unwrapResult(result);
};

export const callFunctionCode = (
  quickVM: QuickJSAsyncContext,
  fnCode: string,
  ctx: QuickJSHandle | null | undefined,
  ...args: QuickJSHandle[]
): QuickJSHandle => {
  const fnH = quickVM.unwrapResult(quickVM.evalCode(fnCode));
  return callFunction(quickVM, fnH, ctx, ...args);
};

export const isHandleInstanceOf = (
  quickVM: QuickJSAsyncContext,
  h: QuickJSHandle,
  instance: string,
): boolean => {
  const res = callFunctionCode(quickVM, `val => val instanceof ${instance}`, null, h);
  return quickVM.dump(res);
};

export const isHandleArray = (quickVM: QuickJSAsyncContext, arrayH: QuickJSHandle): boolean => {
  const isArrayFnH = getQJSPropPath(quickVM, ['Array', 'isArray']);
  const isArray: boolean = callFunction(quickVM, isArrayFnH, null, arrayH).consume(quickVM.dump);
  return isArray;
};

export const getPrototypeOfHandle = (
  quickVM: QuickJSAsyncContext,
  objH: QuickJSHandle,
): QuickJSHandle => {
  const codeGetPrototypeOf = `obj => {
const proto = Object.getPrototypeOf(obj);
return proto && proto !== Object.prototype && proto !== Array.prototype ? proto : undefined;
}`;

  return callFunctionCode(quickVM, codeGetPrototypeOf, null, objH);
};
