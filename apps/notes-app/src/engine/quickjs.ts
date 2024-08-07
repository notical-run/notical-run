import { RELEASE_ASYNC } from 'quickjs-emscripten';
import {
  newQuickJSAsyncWASMModuleFromVariant,
  newVariant,
  QuickJSAsyncRuntime,
  QuickJSAsyncWASMModule,
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

export const getInternalsHandle = (quickVM: QuickJSAsyncContext) =>
  quickVM.getProp(quickVM.global, INTERNALS_KEY);

export const toQuickJSHandle = <T>(quickVM: QuickJSAsyncContext, val: T): QuickJSHandle => {
  // TODO: Handle Promise values
  if (val === null) return quickVM.null;
  if (val === undefined) return quickVM.undefined;
  if (val instanceof Lifetime) return val;
  if (val instanceof Error) return quickVM.newError(val);
  if (typeof val === 'string') return quickVM.newString(val);
  if (typeof val === 'number') return quickVM.newNumber(val);
  if (typeof val === 'boolean') return val ? quickVM.true : quickVM.false;
  if (typeof val === 'function') {
    // Async functions
    if (val instanceof (async () => {}).constructor) {
      return quickVM.newAsyncifiedFunction(val.name, async (...args) => {
        const argsVal = args.map(a => fromQuickJSHandle(quickVM, a));
        return toQuickJSHandle(quickVM, await val(...argsVal));
      });
    }
    return quickVM.newFunction(val.name, (...args) => {
      const argsVal = args.map(a => fromQuickJSHandle(quickVM, a));
      return toQuickJSHandle(quickVM, val(...argsVal));
    });
  }
  // TODO: Promises
  const res = quickVM.evalCode(`(${JSON.stringify(val)})`);
  return quickVM.unwrapResult(res);
};

export const fromQuickJSHandle = <T>(quickVM: QuickJSAsyncContext, handle: QuickJSHandle): T => {
  if (quickVM.typeof(handle) === 'function') {
    const fnHandle = handle.consume(f => f.dup());
    const fnName = quickVM.getProp(fnHandle, 'displayName').consume(quickVM.dump);
    const func = ((...fnArgs: any[]) => {
      const fnArgsHandles = fnArgs.map(arg => toQuickJSHandle(quickVM, arg));
      const res = quickVM.callFunction(fnHandle, quickVM.null, ...fnArgsHandles);
      return quickVM.unwrapResult(res);
    }) as T;
    (func as any).displayName = fnName;
    return func;
  }
  // TODO: Resolve promises
  return handle.consume(quickVM.dump);
};
