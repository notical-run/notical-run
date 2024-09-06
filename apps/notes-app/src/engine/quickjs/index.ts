import { toFunctionHandle } from '@/engine/quickjs/serialize/function';
import { toObjectHandle } from '@/engine/quickjs/serialize/object';
import { toPrimitivesHandle } from '@/engine/quickjs/serialize/primitives';
import { toPromiseHandle } from '@/engine/quickjs/serialize/promise';
import { QuickJSBridge } from '@/engine/quickjs/types';
import {
  callFunctionCode,
  getPrototypeOfHandle,
  isHandleArray,
  isHandleInstanceOf,
} from '@/engine/quickjs/utils';
import { QuickJSAsyncContext, QuickJSHandle } from 'quickjs-emscripten-core';

export const createBridge = (quickVM: QuickJSAsyncContext): QuickJSBridge => {
  return {
    quickVM,
    toHandle: value => toQuickJSHandle(quickVM, value),
    fromHandle: handle => fromQuickJSHandle(quickVM, handle),
  };
};

export const toQuickJSHandle = <T>(quickVM: QuickJSAsyncContext, val: T): QuickJSHandle => {
  const bridge = createBridge(quickVM);

  return (
    toPrimitivesHandle(bridge, val) ??
    toFunctionHandle(bridge, val as any) ??
    toPromiseHandle(bridge, val as any) ??
    toObjectHandle(bridge, val)
  );
};

export const fromQuickJSHandle = <T>(quickVM: QuickJSAsyncContext, handle: QuickJSHandle): T => {
  if (handle === quickVM.undefined) return undefined as T;
  if (handle === quickVM.null) return null as T;
  if (handle === quickVM.global) return null as T;
  const primitiveTypes = ['string', 'number', 'boolean', 'undefined', 'symbol'];
  if (primitiveTypes.includes(quickVM.typeof(handle))) {
    return handle.consume(quickVM.dump) as T;
  }
  const native = quickVM.getString(quickVM.getProp(handle, '__native__'));
  if (['global', 'globalThis', 'state'].includes(native)) {
    handle.dispose(); // Free handle as it wont be used
    return { __native__: native } as T;
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
    const promise = handle.consume(quickVM.resolvePromise);
    return promise.then(res => quickVM.unwrapResult(res)) as T;
  }

  if (isHandleInstanceOf(quickVM, handle, 'Date')) {
    const ds = handle.consume(h => quickVM.getString(h));
    return new Date(ds) as T;
  }

  return handle.consume(objH => {
    const isArray = isHandleArray(quickVM, objH);
    const obj = isArray ? [] : {};

    // For normal objects, de-serialize and set prototype
    if (!isArray) {
      const prototypeH = getPrototypeOfHandle(quickVM, objH);
      const prototype: object = fromQuickJSHandle(quickVM, prototypeH);
      if (prototype) Object.setPrototypeOf(obj, prototype);
    }

    // Iterate over all prop descriptors of object and convert them back
    const codePropDesc = `(obj, cb) => {
      const descriptors = Object.getOwnPropertyDescriptors(obj);
      Object.entries(descriptors).forEach(([key, desc]) => {
        Object.entries(desc).forEach(([pKey, pVal]) => {
          cb(key, pKey, pVal);
        })
      })
    }`;
    const descriptors: PropertyDescriptorMap = {};
    const forEachPropertyDescriptorH = quickVM.newFunction('_', (keyH, pKeyH, descH) => {
      const key = quickVM.getString(keyH);
      const pKey = quickVM.getString(pKeyH) as keyof PropertyDescriptor;
      const desc: PropertyDescriptor = fromQuickJSHandle(quickVM, descH);
      descriptors[key] ??= {};
      descriptors[key][pKey] = desc;
    });

    callFunctionCode(quickVM, codePropDesc, null, objH, forEachPropertyDescriptorH).dispose();

    Object.defineProperties(obj, descriptors);

    forEachPropertyDescriptorH.dispose();

    return obj;
  }) as T;
};
