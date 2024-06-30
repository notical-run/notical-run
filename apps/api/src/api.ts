import { Hono } from 'hono';

const workspaceRoute = new Hono()
  .get(c => c.text('list of workspace'))
  .post(c => c.text('posted workspace'));

export const apiRoute = new Hono().route('/workspace', workspaceRoute);
