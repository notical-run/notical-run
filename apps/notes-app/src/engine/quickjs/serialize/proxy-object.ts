import { QuickJSHandle, Scope } from 'quickjs-emscripten-core';
import { callFunctionCode } from '@/engine/quickjs/utils';
import { QuickJSBridge } from '@/engine/quickjs/types';

export const objectToQuickJSProxyHandle = <T extends Record<any, any>>(
  bridge: QuickJSBridge,
  obj: T,
): QuickJSHandle => {
  const { quickVM } = bridge;

  return Scope.withScope(scope => {
    const getter = scope.manage(
      bridge.toHandle((prop: string) => {
        const result = obj[prop];
        if (typeof result === 'function') {
          return bridge.toHandle((...args: any[]) => {
            return result.call(obj, ...args);
          });
        }
        return result;
      }),
    );
    const setter = scope.manage(
      bridge.toHandle((prop: string, value: any) => {
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
