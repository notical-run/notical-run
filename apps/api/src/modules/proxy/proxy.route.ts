import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { base64 } from 'oslo/encoding';
import { z } from 'zod';
import { delay } from '../../utils/test';
import { HTTPException } from 'hono/http-exception';

const proxyRequestSchema = z.object({
  url: z.string(),
  method: z.enum(['post', 'get', 'patch', 'put', 'delete']),
  headers: z.record(z.string()),
  body: z.string().optional().nullable(),
});

// TODO: Rate limit
// TODO: Cancel fetch on timeout
export const proxyRoute = new Hono().post(
  '/',
  bodyLimit({
    maxSize: 2 * 1024,
    onError: c => c.json({ error: 'Content too large' }, 413),
  }),
  zValidator('json', proxyRequestSchema),
  async ctx => {
    const proxyReq = ctx.req.valid('json');
    const [response, bodyArrayBuffer] = await Promise.race([
      delay(10_000).then(() =>
        Promise.reject(new HTTPException(408, { message: 'Request took too long' })),
      ),
      fetch(proxyReq.url, {
        method: proxyReq.method,
        headers: proxyReq.headers,
        body: proxyReq.body && base64.decode(proxyReq.body),
      }).then(async res => [res, await res.arrayBuffer()] as const),
    ]);

    const body = new Uint8Array(bodyArrayBuffer);

    return ctx.json(
      {
        status: response.status,
        body: base64.encode(body),
        headers: response.headers,
      },
      200,
    );
  },
);
