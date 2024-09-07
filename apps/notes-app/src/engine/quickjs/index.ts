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
  const bridge: QuickJSBridge = {
    quickVM,
    toHandle: value => toQuickJSHandle(bridge, value),
    fromHandle: handle => fromQuickJSHandle(bridge, handle),
  };
  return bridge;
};

const toQuickJSHandle = <T>(bridge: QuickJSBridge, val: T): QuickJSHandle => {
  const handleMaybe = toPrimitivesHandle(bridge, val)
    .or(() => toFunctionHandle(bridge, val as any))
    .or(() => toPromiseHandle(bridge, val as any))
    .or(() => toObjectHandle(bridge, val));

  return Maybe.asValue(handleMaybe) ?? bridge.quickVM.undefined;
};

const fromQuickJSHandle = <T>(bridge: QuickJSBridge, handle: QuickJSHandle): T => {
  const valueMaybe = fromPrimitivesHandle<T>(bridge, handle)
    .or(() => fromFunctionHandle<T>(bridge, handle))
    .or(() => fromPromiseHandle<T>(bridge, handle))
    .or(() => fromObjectHandle<T>(bridge, handle));

  return Maybe.asValue(valueMaybe) as T;
};
