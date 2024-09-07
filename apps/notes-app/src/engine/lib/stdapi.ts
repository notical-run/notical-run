import { getInternalsHandle } from '@/engine/internals';
import { EvalEngineContextOptions } from '@/engine/types';
import { Scope } from 'quickjs-emscripten-core';
import { QuickJSBridge } from '@/engine/quickjs/types';

export const registerStdApiLib = async (
  bridge: QuickJSBridge,
  options: EvalEngineContextOptions,
) => {
  const { quickVM } = bridge;
  quickVM
    .unwrapResult(
      await quickVM.evalCodeAsync(
        `
Object.defineProperty(globalThis, 'console', { value: {}, writable: false });
`,
      ),
    )
    .dispose();

  return Scope.withScope(scope => {
    const consoleObj = scope.manage(quickVM.getProp(quickVM.global, 'console'));
    const internals = scope.manage(getInternalsHandle(quickVM));

    // Doesn't use toQuickJSHandle here to make debugging easier
    // Might change later when toQuickJSHandle is stable enough
    quickVM
      .newFunction('consoleLog', (...args) => {
        console.log('[vm]', ...args.map(arg => bridge.fromHandle(arg)));
      })
      .consume(f => quickVM!.setProp(consoleObj, 'log', f));
    // TODO: console.error, console.warn, console.debug...

    bridge
      .toHandle((...args: Parameters<typeof setTimeout>) => {
        const timer = setTimeout(...args);
        options.onCleanup(() => clearTimeout(timer));
        return timer;
      })
      .consume(f => quickVM.setProp(quickVM.global, 'setTimeout', f));

    bridge
      .toHandle((...args: Parameters<typeof setInterval>) => {
        const timer = setInterval(...args);
        options.onCleanup(() => clearInterval(timer));
        return timer;
      })
      .consume(f => quickVM.setProp(quickVM.global, 'setInterval', f));

    bridge
      .toHandle((id: number) => clearInterval(id))
      .consume(f => quickVM.setProp(quickVM.global, 'clearInterval', f));

    bridge
      .toHandle((id: number) => clearTimeout(id))
      .consume(f => quickVM.setProp(quickVM.global, 'clearTimeout', f));

    // TODO: Expose Intl
    bridge
      .toHandle((date: Date | string, ...args: any[]) =>
        Intl.DateTimeFormat(...args).format(new Date(date)),
      )
      .consume(f => quickVM.setProp(internals, 'formatDateTime', f));
  });
};
