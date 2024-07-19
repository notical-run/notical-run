import { Hono } from 'hono';
import { noteRoute } from './note/note.route';
import { privateRoute, SessionVars } from '../../auth';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createWorkspace, getUserWorkspaces } from './workspace.data';

export const workspaceRoute = new Hono<{ Variables: SessionVars }>()
  .route(':workspaceSlug/notes', noteRoute)

  .post(
    '/',
    privateRoute,
    zValidator('json', z.object({ name: z.string(), slug: z.string() })),
    async c => {
      const workspaceJson = c.req.valid('json');
      const user = c.get('user')!;
      const workspace = await createWorkspace({
        ...workspaceJson,
        authorId: user.id,
      });

      if (!workspace) return c.json({ error: 'Workspace already exists' }, 422);
      return c.json(workspace);
    },
  )

  .get('/', privateRoute, async c => {
    const currentUser = c.get('user')!;
    const workspaces = await getUserWorkspaces(currentUser.id);
    return c.json(workspaces ?? []);
  });
