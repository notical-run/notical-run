import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { base64 } from 'oslo/encoding';
import { z } from 'zod';
import { delay } from '../../utils/test';
import { HTTPException } from 'hono/http-exception';
import { rateLimiter } from 'hono-rate-limiter';
import { hash } from '@node-rs/argon2';
import { privateRoute } from '../../auth';

const proxyRequestSchema = z.object({
  url: z.string(),
  method: z.enum(['post', 'get', 'patch', 'put', 'delete']),
  headers: z.record(z.string()),
  body: z.string().optional().nullable(),
});

const withTimeout = <T>(timeout: number, f: (b: AbortController) => Promise<T>): Promise<T> => {
  const abortCtrl = new AbortController();
  return Promise.race([
    delay(timeout).then(() => {
      abortCtrl.abort('timeout');
      return Promise.reject(
        new HTTPException(408, {
          res: new Response(JSON.stringify({ error: 'Request took too long' }), {
            headers: {
              'Content-Type': 'application/json',
            },
          }),
        }),
      );
    }),
    f(abortCtrl),
  ]);
};

// TODO: Rate limit
// TODO: Require authentication
export const proxyRoute = new Hono().post(
  '/',

  privateRoute,

  rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    limit: 100, // Limit each IP to 100 requests per `window`
    keyGenerator: async c => {
      const auth = c.req.header('Authorization');
      return `proxy-${await hash(auth ?? 'anonymous')}`;
    },
  }),

  bodyLimit({
    maxSize: 2 * 1024,
    onError: c => c.json({ error: 'Content too large' }, 413),
  }),

  zValidator('json', proxyRequestSchema),

  async ctx => {
    const proxyReq = ctx.req.valid('json');
    const [response, bodyArrayBuffer] = await withTimeout(10_000, abortCtrl =>
      fetch(proxyReq.url, {
        method: proxyReq.method,
        headers: proxyReq.headers,
        body: proxyReq.body && base64.decode(proxyReq.body),
        signal: abortCtrl.signal,
      }).then(async res => {
        // TODO: Exception if content too large
        return [res, await res.arrayBuffer()] as const;
      }),
    );

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
