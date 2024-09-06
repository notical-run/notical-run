import { RELEASE_ASYNC } from 'quickjs-emscripten';
import {
  newQuickJSAsyncWASMModuleFromVariant,
  newVariant,
  QuickJSAsyncRuntime,
  QuickJSAsyncWASMModule,
} from 'quickjs-emscripten-core';
import wasmLocation from '@jitl/quickjs-wasmfile-release-asyncify/wasm?url';

const variant = newVariant(RELEASE_ASYNC, { wasmLocation });

let quickJS: Promise<QuickJSAsyncWASMModule> | undefined;
export async function getQuickJS() {
  if (quickJS) return quickJS;
  quickJS = newQuickJSAsyncWASMModuleFromVariant(variant);
  return quickJS;
}

let quickRuntime: QuickJSAsyncRuntime | undefined;
export async function getQuickJSRuntime() {
  const quickJS = await getQuickJS();
  if (!quickJS) throw new Error('Unable to initialize quickjs');

  quickRuntime = quickRuntime || quickJS.newRuntime();

  return quickRuntime;
}
