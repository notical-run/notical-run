import { toQuickJSHandle } from '@/engine/quickjs';
import { QuickJSContextOptions } from '@/engine/types';
import { QuickJSAsyncContext } from 'quickjs-emscripten-core';

export const registerUILib = async (
  quickVM: QuickJSAsyncContext,
  options: QuickJSContextOptions,
) => {
  toQuickJSHandle(quickVM, async (message: string) => {
    await new Promise(resolve => {
      options.apiHelpers.alert({ message, onClose: () => resolve(undefined) });
    });
  }).consume(f => {
    quickVM!.setProp(quickVM.global, 'alert', f);
    quickVM!.setProp(quickVM.global, 'notify', f.dup());
  });

  toQuickJSHandle(quickVM, async (message: string) => {
    return new Promise(resolve => {
      options.apiHelpers.confirm({
        message,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  }).consume(f => quickVM!.setProp(quickVM.global, 'confirm', f));

  toQuickJSHandle(quickVM, async (message: string, defaultValue?: string) => {
    return new Promise(resolve => {
      options.apiHelpers.prompt({
        message,
        onValue: value => resolve(value ?? defaultValue),
      });
    });
  }).consume(f => quickVM!.setProp(quickVM.global, 'prompt', f));
};
