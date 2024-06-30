import { Hono } from 'hono';

export const workspaceRoute = new Hono()
  .get(c => c.text('list of workspace'))
  .post(c => c.text('posted workspace'));
