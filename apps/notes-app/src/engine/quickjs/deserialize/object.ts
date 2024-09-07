import { QuickJSBridge } from '@/engine/quickjs/types';
import {
  isHandleInstanceOf,
  isHandleArray,
  getPrototypeOfHandle,
  callFunctionCode,
} from '@/engine/quickjs/utils';
import { Maybe } from '@/utils/maybe';
import { QuickJSHandle } from 'quickjs-emscripten-core';

export const fromObjectHandle = <T>(bridge: QuickJSBridge, handle: QuickJSHandle): Maybe<T> => {
  const { quickVM } = bridge;

  // Date object
  if (isHandleInstanceOf(quickVM, handle, 'Date')) {
    const ds = handle.consume(h => quickVM.getString(h));
    return Maybe.Just(new Date(ds) as T);
  }

  return handle.consume(objH => {
    const isArray = isHandleArray(quickVM, objH);
    const obj = isArray ? [] : {};

    // For normal objects, de-serialize and set prototype
    if (!isArray) {
      const prototypeH = getPrototypeOfHandle(quickVM, objH);
      const prototype: object = bridge.fromHandle(prototypeH);
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
      const desc: PropertyDescriptor = bridge.fromHandle(descH);
      descriptors[key] ??= {};
      descriptors[key][pKey] = desc;
    });

    callFunctionCode(quickVM, codePropDesc, null, objH, forEachPropertyDescriptorH).dispose();

    Object.defineProperties(obj, descriptors);

    forEachPropertyDescriptorH.dispose();

    return Maybe.Just(obj as T);
  });
};
