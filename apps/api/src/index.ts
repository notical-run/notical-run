import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { apiRoute } from './api';
import { authenticationMiddleware } from './auth';
import { csrf } from 'hono/csrf';
import { timeout } from 'hono/timeout';

const isDevEnv = import.meta.env.NODE_ENV === 'development';

const app = new Hono();

if (isDevEnv) {
  app.use(logger());
}

app.use(
  cors({
    origin: isDevEnv ? 'http://localhost:3000' : 'https://app.notical.run',
    allowMethods: ['POST', 'GET', 'OPTIONS', 'PATCH', 'DELETE'],
    maxAge: 600,
  }),
);

app.use(csrf({ origin: ['localhost:3000', 'app.notical.run'] }));

app.use(timeout(10_000));

app.use(authenticationMiddleware);

// app.use(
//   rateLimiter({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     limit: 100, // Limit each IP to 100 requests per `window`
//     standardHeaders: 'draft-6',
//     keyGenerator: async c => {
//       const auth = c.req.header('Authorization');
//       return `${auth}-${c.req.path}`;
//     },
//   }),
// );

const route = app
  .get('/health', c => {
    return c.json({ success: true, message: 'All gucci in here!' }, 200);
  })
  .route('/api', apiRoute);

export type RouteType = typeof route;

export default route;
