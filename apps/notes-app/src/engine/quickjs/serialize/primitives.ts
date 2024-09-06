import { QuickJSBridge } from '@/engine/quickjs/types';
import { Lifetime, QuickJSHandle } from 'quickjs-emscripten-core';

export const toPrimitivesHandle = (bridge: QuickJSBridge, value: any): QuickJSHandle | null => {
  const { quickVM } = bridge;

  if (value === window) return quickVM.null;
  if (value === null) return quickVM.null;
  if (value === undefined) return quickVM.undefined;
  if (value instanceof Lifetime) return value;
  if (value instanceof Error) return quickVM.newError(value);
  if (typeof value === 'string') return quickVM.newString(value);
  if (typeof value === 'number') return quickVM.newNumber(value);
  if (typeof value === 'boolean') return value ? quickVM.true : quickVM.false;

  return null;
};
