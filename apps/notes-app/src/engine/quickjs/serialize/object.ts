import { QuickJSBridge } from '@/engine/quickjs/types';
import { callFunctionCode, getQJSPropPath } from '@/engine/quickjs/utils';
import { Maybe } from '@/utils/maybe';
import { QuickJSHandle } from 'quickjs-emscripten-core';

export const toObjectHandle = (bridge: QuickJSBridge, value: any): Maybe<QuickJSHandle> => {
  const { quickVM } = bridge;

  if (typeof value !== 'object') return Maybe.Nothing();

  // Date
  if (value instanceof Date) {
    const date = quickVM.newString(value.toString());
    return Maybe.Just(callFunctionCode(quickVM, `ds => new Date(ds)`, null, date));
  }

  const objectDefineProperties = getQJSPropPath(quickVM, ['Object', 'defineProperties']);
  const objectSetPrototypeOf = getQJSPropPath(quickVM, ['Object', 'setPrototypeOf']);

  const objectH = Array.isArray(value) ? quickVM.newArray() : quickVM.newObject();

  // Copy over the prototype
  const prototype = Object.getPrototypeOf(value);
  if (prototype && prototype !== Object.prototype && prototype !== Array.prototype) {
    const prototypeH = bridge.toHandle(prototype);
    quickVM.callFunction(objectSetPrototypeOf, quickVM.undefined, objectH, prototypeH);
  }

  const descriptors: PropertyDescriptorMap = value ? Object.getOwnPropertyDescriptors(value) : {};

  const descriptorsH = quickVM.newObject();
  for (const [key, descriptor] of Object.entries(descriptors)) {
    const descH = quickVM.newObject();
    for (const [pKey, pVal] of Object.entries(descriptor)) {
      bridge.toHandle(pVal).consume(pHandle => quickVM.setProp(descH, pKey, pHandle));
    }
    descH.consume(descH => quickVM.setProp(descriptorsH, key, descH));
  }

  quickVM
    .unwrapResult(
      quickVM.callFunction(objectDefineProperties, quickVM.undefined, objectH, descriptorsH),
    )
    .dispose();

  descriptorsH.dispose();
  objectDefineProperties.dispose();

  return Maybe.Just(objectH);
};
