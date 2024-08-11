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
  const httpFetch = async (url: string, requestInit: RequestInit): Promise<Response> => {
    requestInit.method ??= 'GET';
    requestInit.method = requestInit.method.trim();
    if (/get|delete/i.test(requestInit.method ?? '')) {
      delete requestInit.body;
    }
    const request = new Request(url, requestInit);
    return options.apiHelpers.fetch(request);
  };

  const jsonParse = (str: string) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  };

  // Fetch JSON
  toQuickJSHandle(
    quickVM,
    asAsync(async (url: string, requestInit: RequestInit) => {
      const response = await httpFetch(url, requestInit);
      const body = await response.text();
      return {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: jsonParse(body),
        bodyRaw: body,
      };
    }),
  ).consume(f => {
    quickVM!.setProp(quickVM.global, 'fetchJSON', f);
  });

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
      const body = await response.text();
      return {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body,
        bodyRaw: body,
      };
    }),
  ).consume(f => {
    quickVM!.setProp(quickVM.global, 'fetchText', f);
  });
};
