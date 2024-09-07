import { QuickJSBridge } from '@/engine/quickjs/types';
import { Maybe } from '@/utils/maybe';
import { QuickJSHandle } from 'quickjs-emscripten-core';

export const fromPrimitivesHandle = <T>(bridge: QuickJSBridge, handle: QuickJSHandle): Maybe<T> => {
  const { quickVM } = bridge;

  if (handle === quickVM.undefined) return Maybe.Just(undefined as T);
  if (handle === quickVM.null) return Maybe.Just(null as T);
  if (handle === quickVM.global) return Maybe.Just(null as T);
  const primitiveTypes = ['string', 'number', 'boolean', 'undefined', 'symbol'];
  if (primitiveTypes.includes(quickVM.typeof(handle))) {
    return Maybe.Just(handle.consume(quickVM.dump) as T);
  }
  const native = quickVM.getString(quickVM.getProp(handle, '__native__'));
  if (['global', 'globalThis', 'state'].includes(native)) {
    handle.dispose(); // Free handle as it wont be used
    return Maybe.Just({ __native__: native } as T);
  }

  return Maybe.Nothing();
};
