import {
  fromQuickJSHandle,
  getInternalsHandle,
  toFunctionHandle,
  toQuickJSHandle,
} from '@/engine/quickjs';
import { EvalEngineContextOptions } from '@/engine/types';
import { QuickJSAsyncContext, Scope } from 'quickjs-emscripten-core';

export const registerStdApiLib = async (
  quickVM: QuickJSAsyncContext,
  options: EvalEngineContextOptions,
) => {
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
        console.log('[vm]', ...args.map(arg => fromQuickJSHandle(quickVM, arg)));
      })
      .consume(f => quickVM!.setProp(consoleObj, 'log', f));
    // TODO: console.error, console.warn, console.debug...

    toFunctionHandle(quickVM, (...args: Parameters<typeof setTimeout>) => {
      const timer = setTimeout(...args);
      options.onCleanup(() => clearTimeout(timer));
      return timer;
    }).consume(f => quickVM.setProp(quickVM.global, 'setTimeout', f));

    toQuickJSHandle(quickVM, (...args: Parameters<typeof setInterval>) => {
      const timer = setInterval(...args);
      options.onCleanup(() => clearInterval(timer));
      return timer;
    }).consume(f => quickVM.setProp(quickVM.global, 'setInterval', f));

    toQuickJSHandle(quickVM, clearInterval).consume(f =>
      quickVM.setProp(quickVM.global, 'clearInterval', f),
    );

    toQuickJSHandle(quickVM, clearTimeout).consume(f =>
      quickVM.setProp(quickVM.global, 'clearTimeout', f),
    );

    // TODO: Expose Intl
    toQuickJSHandle(quickVM, (date: Date | string, ...args: any[]) =>
      Intl.DateTimeFormat(...args).format(new Date(date)),
    ).consume(f => quickVM.setProp(internals, 'formatDateTime', f));
  });
};
