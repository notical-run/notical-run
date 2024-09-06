import { QuickJSAsyncContext, QuickJSHandle, Scope } from 'quickjs-emscripten-core';
import { toQuickJSHandle } from '@/engine/quickjs';
import { callFunctionCode } from '@/engine/quickjs/utils';

export const objectToQuickJSProxyHandle = <T extends Record<any, any>>(
  quickVM: QuickJSAsyncContext,
  obj: T,
): QuickJSHandle => {
  return Scope.withScope(scope => {
    const getter = scope.manage(
      toQuickJSHandle(quickVM, (prop: string) => {
        const result = obj[prop];
        if (typeof result === 'function') {
          return toQuickJSHandle(quickVM, (...args: any[]) => {
            return result.call(obj, ...args);
          });
        }
        return result;
      }),
    );
    const setter = scope.manage(
      toQuickJSHandle(quickVM, (prop: string, value: any) => {
        return Reflect.set(obj, prop, value);
      }),
    );

    const proxyCode = `(getter, setter) =>
new Proxy({}, {
  get: (target, prop) => {
    return getter.call(undefined, prop);
  },
  set: (target, prop, value) => {
    if (prop === '__proto__') return; 
    return setter.call(undefined, prop, value);
  },
})
`;

    return callFunctionCode(quickVM, proxyCode, null, getter, setter);
  });
};
