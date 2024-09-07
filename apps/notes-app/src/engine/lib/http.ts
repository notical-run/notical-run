import { objectToQuickJSProxyHandle } from '@/engine/quickjs/serialize/proxy-object';
import { QuickJSBridge } from '@/engine/quickjs/types';
import { asAsync } from '@/engine/quickjs/utils';
import { EvalEngineContextOptions } from '@/engine/types';

export const registerHTTPLIb = async (bridge: QuickJSBridge, options: EvalEngineContextOptions) => {
  const { quickVM } = bridge;

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

  bridge
    .toHandle((...args: ConstructorParameters<typeof Request>) => {
      return objectToQuickJSProxyHandle(bridge, new Request(...args));
    })
    .consume(c => quickVM.setProp(quickVM.global, 'Request', c));

  bridge
    .toHandle((...args: ConstructorParameters<typeof Response>) => {
      return objectToQuickJSProxyHandle(bridge, new Response(...args));
    })
    .consume(c => quickVM.setProp(quickVM.global, 'Response', c));

  bridge
    .toHandle(
      asAsync(async (url: string, requestInit: RequestInit) => {
        const response = await httpFetch(url, requestInit);
        return objectToQuickJSProxyHandle(bridge, response);
      }),
    )
    .consume(c => quickVM.setProp(quickVM.global, 'fetch', c));

  // Fetch JSON
  bridge
    .toHandle(
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
    )
    .consume(f => {
      quickVM!.setProp(quickVM.global, 'fetchJSON', f);
    });

  // Fetch text
  bridge
    .toHandle(
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
    )
    .consume(f => {
      quickVM!.setProp(quickVM.global, 'fetchText', f);
    });
};
