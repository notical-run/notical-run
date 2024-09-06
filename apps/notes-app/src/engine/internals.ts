import { QuickJSAsyncContext } from 'quickjs-emscripten-core';

export const INTERNALS_KEY = '_internals';

export const getInternalsHandle = (quickVM: QuickJSAsyncContext) =>
  quickVM.getProp(quickVM.global, INTERNALS_KEY);
