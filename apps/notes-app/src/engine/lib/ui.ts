import { toQuickJSHandle } from '@/engine/quickjs';
import { QuickJSContextOptions } from '@/engine/types';
import { QuickJSAsyncContext } from 'quickjs-emscripten-core';

export const registerUILib = async (
  quickVM: QuickJSAsyncContext,
  options: QuickJSContextOptions,
) => {
  // button() helper for labelled inline buttons
  quickVM
    .unwrapResult(
      await quickVM.evalCodeAsync(`{
Object.defineProperty(globalThis, 'button', {
  writable: false,
  value: (name, fn) => Object.assign(fn, { displayName: name }),
});

Object.defineProperty(globalThis, 'table', {
  writable: false,
  value: (rows_, headings_) => {
    const headings = headings_ || Object.keys(rows_[0]);
    const row = vals => \`| \${vals.join(' | ')} |\`;
    const heading = row(headings);
    const headingSep = row(headings.map(_ => ' --- '));
    const rows = rows_.map(r => row(headings.map(h => r[h])));
    return [heading, headingSep, ...rows].join('\\n');
  },
});
      }`),
    )
    .dispose();

  // Alert/Notify
  toQuickJSHandle(quickVM, async (message: string) => {
    await new Promise(resolve => {
      options.apiHelpers.alert({ message, onClose: () => resolve(undefined) });
    });
  }).consume(f => {
    quickVM!.setProp(quickVM.global, 'alert', f);
    quickVM!.setProp(quickVM.global, 'notify', f.dup());
  });

  // Confirm dialog
  toQuickJSHandle(quickVM, async (message: string) => {
    return new Promise(resolve => {
      options.apiHelpers.confirm({
        message,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  }).consume(f => quickVM!.setProp(quickVM.global, 'confirm', f));

  // Prompt dialog
  toQuickJSHandle(quickVM, async (message: string, defaultValue?: string) => {
    return new Promise(resolve => {
      options.apiHelpers.prompt({
        message,
        onValue: value => resolve(value ?? defaultValue),
      });
    });
  }).consume(f => quickVM!.setProp(quickVM.global, 'prompt', f));
};
