import { Hono } from 'hono';
import { apiRoute } from './api';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono();

app.use(
  cors({
    origin: '*', // TODO: fix this
  }),
);

app.use(logger());

const route = app
  .get('/health', c => {
    return c.text('All gucci in here!');
  })
  .route('/api', apiRoute);

export type RouteType = typeof route;

export default route;
