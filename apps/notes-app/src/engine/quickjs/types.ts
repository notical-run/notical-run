import { QuickJSAsyncContext, QuickJSHandle } from 'quickjs-emscripten-core';

export interface QuickJSBridge {
  quickVM: QuickJSAsyncContext;
  toHandle<T>(value: T): QuickJSHandle;
  fromHandle<T>(handle: QuickJSHandle): T;
}
