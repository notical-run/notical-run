import { QuickJSBridge } from '@/engine/quickjs/types';
import { Maybe } from '@/utils/maybe';
import { Lifetime, QuickJSHandle } from 'quickjs-emscripten-core';

export const toPrimitivesHandle = (bridge: QuickJSBridge, value: any): Maybe<QuickJSHandle> => {
  const { quickVM } = bridge;

  if (value === window) return Maybe.Just(quickVM.null);
  if (value === null) return Maybe.Just(quickVM.null);
  if (value === undefined) return Maybe.Just(quickVM.undefined);
  if (value instanceof Lifetime) return Maybe.Just(value);
  if (value instanceof Error) return Maybe.Just(quickVM.newError(value));
  if (typeof value === 'string') return Maybe.Just(quickVM.newString(value));
  if (typeof value === 'number') return Maybe.Just(quickVM.newNumber(value));
  if (typeof value === 'boolean') return Maybe.Just(value ? quickVM.true : quickVM.false);

  return Maybe.Nothing();
};
