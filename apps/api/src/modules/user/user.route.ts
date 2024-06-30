import { Hono } from 'hono';

export const userRoute = new Hono()
  .get(c => c.json([]))
  .post(c => c.text('not implemented yet'));
