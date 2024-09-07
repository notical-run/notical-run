import { QuickJSBridge } from '@/engine/quickjs/types';
import { EvalEngineContextOptions } from '@/engine/types';

export const registerUILib = async (bridge: QuickJSBridge, options: EvalEngineContextOptions) => {
  const { quickVM } = bridge;

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
    if (!headings_ && !rows_?.length) throw new Error('Cant create a table with no items')
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
  bridge
    .toHandle(async (message: string) => {
      await new Promise(resolve => {
        options.apiHelpers.alert({ message, onClose: () => resolve(undefined) });
      });
    })
    .consume(f => {
      quickVM!.setProp(quickVM.global, 'alert', f);
      quickVM!.setProp(quickVM.global, 'notify', f.dup());
    });

  // Confirm dialog
  bridge
    .toHandle(async (message: string) => {
      return new Promise(resolve => {
        options.apiHelpers.confirm({
          message,
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
    })
    .consume(f => quickVM!.setProp(quickVM.global, 'confirm', f));

  // Prompt dialog
  bridge
    .toHandle(async (message: string, defaultValue?: string) => {
      return new Promise(resolve => {
        options.apiHelpers.prompt({
          message,
          onValue: value => resolve(value ?? defaultValue),
        });
      });
    })
    .consume(f => quickVM!.setProp(quickVM.global, 'prompt', f));
};
