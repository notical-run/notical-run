import { asAsync, objectToQuickJSProxyHandle, toQuickJSHandle } from '@/engine/quickjs';
import { QuickJSContextOptions } from '@/engine/types';
import { QuickJSAsyncContext } from 'quickjs-emscripten-core';

export const registerHTTPLIb = async (
  quickVM: QuickJSAsyncContext,
  options: QuickJSContextOptions,
) => {
  const httpFetch = async (url: string, requestInit?: RequestInit): Promise<Response> => {
    requestInit ??= {};
    requestInit.method ??= 'get';
    requestInit.method = requestInit.method.trim().toLowerCase();
    if (['get', 'delete'].includes(requestInit.method)) {
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

  toQuickJSHandle(quickVM, (...args: ConstructorParameters<typeof Request>) => {
    return objectToQuickJSProxyHandle(quickVM, new Request(...args));
  }).consume(c => quickVM.setProp(quickVM.global, 'Request', c));

  toQuickJSHandle(quickVM, (...args: ConstructorParameters<typeof Response>) => {
    return objectToQuickJSProxyHandle(quickVM, new Response(...args));
  }).consume(c => quickVM.setProp(quickVM.global, 'Response', c));

  toQuickJSHandle(
    quickVM,
    asAsync(async (url: string, requestInit: RequestInit) => {
      const response = await httpFetch(url, requestInit);
      return objectToQuickJSProxyHandle(quickVM, response);
    }),
  ).consume(c => quickVM.setProp(quickVM.global, 'fetch', c));

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

  // Fetch text
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
