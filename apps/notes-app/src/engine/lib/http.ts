import { toQuickJSHandle } from '@/engine/quickjs';
import { QuickJSContextOptions } from '@/engine/types';
import { QuickJSAsyncContext } from 'quickjs-emscripten-core';

const asAsync =
  (fn: (...a: any[]) => any) =>
  (...args: any[]) =>
    fn(...args);

export const registerHTTPLIb = async (
  quickVM: QuickJSAsyncContext,
  options: QuickJSContextOptions,
) => {
  // Fetch JSON
  toQuickJSHandle(
    quickVM,
    asAsync(async (url: string, requestInit: RequestInit) => {
      requestInit.method ??= 'GET';
      if (/get|delete/i.test(requestInit.method ?? '')) {
        delete requestInit.body;
      }
      const request = new Request(url, requestInit);
      const response = await options.apiHelpers.fetch(request);
      const json = await response.json();
      return {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: json,
      };
    }),
  ).consume(f => {
    quickVM!.setProp(quickVM.global, 'fetchJSON', f);
  });
};
