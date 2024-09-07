import { fromFunctionHandle } from '@/engine/quickjs/deserialize/function';
import { fromObjectHandle } from '@/engine/quickjs/deserialize/object';
import { fromPrimitivesHandle } from '@/engine/quickjs/deserialize/primitives';
import { fromPromiseHandle } from '@/engine/quickjs/deserialize/promise';
import { toFunctionHandle } from '@/engine/quickjs/serialize/function';
import { toObjectHandle } from '@/engine/quickjs/serialize/object';
import { toPrimitivesHandle } from '@/engine/quickjs/serialize/primitives';
import { toPromiseHandle } from '@/engine/quickjs/serialize/promise';
import { QuickJSBridge } from '@/engine/quickjs/types';
import { Maybe } from '@/utils/maybe';
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
  const handleMaybe = toPrimitivesHandle(bridge, val)
    .or(() => toFunctionHandle(bridge, val as any))
    .or(() => toPromiseHandle(bridge, val as any))
    .or(() => toObjectHandle(bridge, val));

  return Maybe.asValue(handleMaybe) ?? quickVM.undefined;
};

export const fromQuickJSHandle = <T>(quickVM: QuickJSAsyncContext, handle: QuickJSHandle): T => {
  const bridge = createBridge(quickVM);
  const valueMaybe = fromPrimitivesHandle<T>(bridge, handle)
    .or(() => fromFunctionHandle<T>(bridge, handle))
    .or(() => fromPromiseHandle<T>(bridge, handle))
    .or(() => fromObjectHandle<T>(bridge, handle));

  return Maybe.asValue(valueMaybe) as T;
};
