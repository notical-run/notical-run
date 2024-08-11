import { apiClient } from '@/utils/api-client';
import toast from 'solid-toast';

export const fetchViaProxyApi = async (request: Request) => {
  const arraybuf = await request.arrayBuffer();
  const data = new Uint8Array(arraybuf);
  const decoder = new TextDecoder('utf8');
  const b64encoded = btoa(decoder.decode(data));

  const resp = await apiClient.api.proxy.$post({
    json: {
      url: request.url,
      method: request.method.toLowerCase() as any,
      headers: request.headers && Object.fromEntries(request.headers.entries()),
      body: b64encoded,
    },
  });

  if (!resp.ok) {
    let msg;
    if ((resp.status as any) === 401) {
      msg = 'You need to be logged in to make http requests';
    } else {
      const body: any = await resp.json();
      msg = body.error ?? 'Something went wrong';
    }
    toast.error(msg);
    throw new Error(msg);
  }

  const respData = await resp.json();
  const body = atob(respData.body);
  return new Response(body, {
    status: respData.status,
    headers: respData.headers,
  });
};
