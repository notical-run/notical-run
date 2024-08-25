import { RELEASE_ASYNC } from 'quickjs-emscripten';
import {
  newQuickJSAsyncWASMModuleFromVariant,
  newVariant,
  QuickJSAsyncRuntime,
  QuickJSAsyncWASMModule,
  Scope,
} from 'quickjs-emscripten-core';
import wasmLocation from '@jitl/quickjs-wasmfile-release-asyncify/wasm?url';
import { Lifetime, QuickJSAsyncContext, QuickJSHandle } from 'quickjs-emscripten-core';

const variant = newVariant(RELEASE_ASYNC, { wasmLocation });

let quickJS: Promise<QuickJSAsyncWASMModule> | undefined;
export async function getQuickJS() {
  if (quickJS) return quickJS;
  quickJS = newQuickJSAsyncWASMModuleFromVariant(variant);
  return quickJS;
}

let quickRuntime: QuickJSAsyncRuntime | undefined;
export async function getQuickJSRuntime() {
  const quickJS = await getQuickJS();
  if (!quickJS) throw new Error('Unable to initialize quickjs');

  quickRuntime = quickRuntime || quickJS.newRuntime();

  return quickRuntime;
}

export const INTERNALS_KEY = '_internals';

export const asAsync =
  (fn: (...a: any[]) => any) =>
  (...args: any[]) =>
    fn(...args);

export const getInternalsHandle = (quickVM: QuickJSAsyncContext) =>
  quickVM.getProp(quickVM.global, INTERNALS_KEY);

export const getQJSPropPath = (
  quickVM: QuickJSAsyncContext,
  path: string[],
  obj: QuickJSHandle = quickVM.global,
) => path.reduce((result, key) => quickVM.getProp(result, key), obj);

const callFunctionCode = (
  quickVM: QuickJSAsyncContext,
  fnCode: string,
  ctx: QuickJSHandle | null | undefined,
  ...args: QuickJSHandle[]
): QuickJSHandle => {
  const fnH = quickVM.unwrapResult(quickVM.evalCode(fnCode));
  const result = fnH.consume(f => quickVM.callFunction(f, ctx ?? quickVM.undefined, ...args));
  return quickVM.unwrapResult(result);
};

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

export const toFunctionHandle = (
  quickVM: QuickJSAsyncContext,
  fn: (...a: any[]) => any,
): QuickJSHandle => {
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
    return quickVM.newAsyncifiedFunction(fn.name, async function (...args) {
      const argsVal = args.map(a => fromQuickJSHandle(quickVM, a));
      const ctx = fromQuickJSHandle(quickVM, this);
      return toQuickJSHandle(quickVM, await fn.call(ctx, ...argsVal));
    });
  }

  return toInternalFunction(
    quickVM.newFunction(fn.name, function (...args) {
      const argsVal = args.map(a => fromQuickJSHandle(quickVM, a));
      const ctx = fromQuickJSHandle(quickVM, this);
      return toQuickJSHandle(quickVM, fn.call(ctx, ...argsVal));
    }),
  );
};

export const toQuickJSHandle = <T>(
  quickVM: QuickJSAsyncContext,
  val: T,
  { _debugKey: _debugKey }: { _debugKey?: any } = {},
): QuickJSHandle => {
  if (val === window) return quickVM.null;
  if (val === null) return quickVM.null;
  if (val === undefined) return quickVM.undefined;
  if (val instanceof Lifetime) return val;
  if (val instanceof Error) return quickVM.newError(val);
  if (typeof val === 'string') return quickVM.newString(val);
  if (typeof val === 'number') return quickVM.newNumber(val);
  if (typeof val === 'boolean') return val ? quickVM.true : quickVM.false;
  if (val instanceof Promise) {
    const promH = quickVM.newPromise();
    val
      .then(v => promH.resolve(toQuickJSHandle(quickVM, v)))
      .catch(e => promH.reject(toQuickJSHandle(quickVM, e)));
    promH.settled.then(quickVM.runtime.executePendingJobs);
    return promH.handle;
  }

  if (typeof val === 'function') {
    return toFunctionHandle(quickVM, val as any);
  }

  const objectDefineProperties = getQJSPropPath(quickVM, ['Object', 'defineProperties']);
  const objectSetPrototypeOf = getQJSPropPath(quickVM, ['Object', 'setPrototypeOf']);

  const newObjectH = Array.isArray(val) ? quickVM.newArray() : quickVM.newObject();

  // Copy over the prototype
  const prototype = Object.getPrototypeOf(val);
  if (prototype && prototype !== Object.prototype && prototype !== Array.prototype) {
    const prototypeH = toQuickJSHandle(quickVM, prototype, { _debugKey: ['prototype', val] });
    quickVM.callFunction(objectSetPrototypeOf, quickVM.undefined, newObjectH, prototypeH);
  }

  const descriptors: PropertyDescriptorMap = val ? Object.getOwnPropertyDescriptors(val) : {};

  const descriptorsH = quickVM.newObject();
  for (const [key, descriptor] of Object.entries(descriptors)) {
    const descH = quickVM.newObject();
    for (const [pKey, pVal] of Object.entries(descriptor)) {
      toQuickJSHandle(quickVM, pVal).consume(pHandle => quickVM.setProp(descH, pKey, pHandle));
    }
    descH.consume(descH => quickVM.setProp(descriptorsH, key, descH));
  }

  quickVM
    .unwrapResult(
      quickVM.callFunction(objectDefineProperties, quickVM.undefined, newObjectH, descriptorsH),
    )
    .dispose();

  descriptorsH.dispose();
  objectDefineProperties.dispose();

  return newObjectH;
};

export const fromQuickJSHandle = <T>(
  quickVM: QuickJSAsyncContext,
  handle: QuickJSHandle,
  { ignoreContext }: { ignoreContext?: boolean } = {},
): T => {
  if (handle === quickVM.undefined) return undefined as T;
  if (handle === quickVM.null) return null as T;
  if (handle === quickVM.global) return null as T;
  const native = quickVM.getString(quickVM.getProp(handle, '__native__'));
  if (['global', 'globalThis', 'state'].includes(native)) return { __native__: native } as T;

  const primitiveTypes = ['string', 'number', 'boolean', 'undefined', 'symbol'];
  if (primitiveTypes.includes(quickVM.typeof(handle))) {
    return handle.consume(quickVM.dump) as T;
  }

  if (quickVM.typeof(handle) === 'function') {
    const fnHandle = handle.consume(f => f.dup()); // Create a copy to keep it alive inside closure
    function func(this: any, ...fnArgs: any[]) {
      const fnArgsHandles = fnArgs.map(arg => toQuickJSHandle(quickVM, arg));
      const ctx = toQuickJSHandle(quickVM, this);
      const res = quickVM.callFunction(fnHandle, ctx, ...fnArgsHandles);
      return fromQuickJSHandle(quickVM, quickVM.unwrapResult(res));
    }
    (func as any).displayName = quickVM.getProp(fnHandle, 'displayName').consume(quickVM.dump);
    return func as T;
  }

  const promiseState: any = quickVM.getPromiseState(handle);
  if (!promiseState.notAPromise) {
    return quickVM.resolvePromise(handle).then(x => {
      return quickVM.unwrapResult(x);
    }) as T;
  }

  return handle.consume(objH => {
    const prototypeH = quickVM
      .unwrapResult(
        quickVM.evalCode(
          `obj => {
const proto = Object.getPrototypeOf(obj);
return proto && proto !== Object.prototype && proto !== Array.prototype ? proto : undefined;
}`,
        ),
      )
      .consume(getPrototype => {
        return quickVM.unwrapResult(quickVM.callFunction(getPrototype, quickVM.undefined, objH));
      });

    const prototype: object = fromQuickJSHandle(quickVM, prototypeH);
    const obj = {};
    if (prototype) {
      Object.setPrototypeOf(obj, prototype);
    }

    const descriptors: PropertyDescriptorMap = {};
    quickVM
      .unwrapResult(
        quickVM.evalCode(`(obj, cb) => {
const descriptors = Object.getOwnPropertyDescriptors(obj);
Object.entries(descriptors).forEach(([key, desc]) => {
  Object.entries(desc).forEach(([pKey, pVal]) => {
    cb(key, pKey, pVal);
  })
})
}`),
      )
      .consume(forEachPropertyDescriptors => {
        quickVM
          .unwrapResult(
            quickVM.callFunction(
              forEachPropertyDescriptors,
              quickVM.undefined,
              objH,
              quickVM.newFunction('_', (keyH, pKeyH, descH) => {
                const key = quickVM.getString(keyH);
                const pKey = quickVM.getString(pKeyH) as keyof PropertyDescriptor;
                const desc: PropertyDescriptor = fromQuickJSHandle(quickVM, descH);
                descriptors[key] ??= {};
                descriptors[key][pKey] = desc;
              }),
            ),
          )
          .dispose();
      });

    Object.defineProperties(obj, descriptors);

    return obj;
  }) as T;
};
