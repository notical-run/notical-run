import { Hono } from 'hono';
import { db } from '../../db';
import { eq } from 'drizzle-orm';
import { Workspace } from '../../db/schema';
import { noteRoute } from './note/note.route';

export const workspaceRoute = new Hono()
  .route('/:workspaceId/notes', noteRoute)
  .get('/:workspaceId', async c => {
    const workspaceId = c.req.param('workspaceId');
    const workspace = await db.query.Workspace.findFirst({
      where: eq(Workspace.id, workspaceId),
    });

    return c.json(workspace);
  })
  .get('/', async c => {
    const user = await db.query.User.findFirst({
      with: {
        workspaces: {},
      },
    });

    return c.json(user?.workspaces ?? []);
  })
  .post(c => c.text('posted workspace'));
