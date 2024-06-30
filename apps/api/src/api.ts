import { Hono } from 'hono';
import { userRoute } from './modules/user/user.route';
import { workspaceRoute } from './modules/workspace/workspace.route';

export const apiRoute = new Hono()
  .route('/workspace', workspaceRoute)
  .route('/users', userRoute);
