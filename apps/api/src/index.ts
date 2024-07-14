import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { apiRoute } from './api';

const app = new Hono();

app.use(
  cors({
    origin: '*', // TODO: fix this
  }),
);

if (import.meta.env.NODE_ENV !== 'test') {
  app.use(logger());
}

const route = app
  .get('/health', c => {
    return c.text('All gucci in here!');
  })
  .route('/api', apiRoute);

export type RouteType = typeof route;

export default route;
