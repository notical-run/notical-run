import { Hono } from 'hono';
import { userRoute } from './modules/user/user.route';
import { workspaceRoute } from './modules/workspace/workspace.route';
import { authRoute } from './modules/auth/auth.route';

export const apiRoute = new Hono()
  .route('/workspaces', workspaceRoute)
  .route('/users', userRoute)
  .route('/auth', authRoute);
