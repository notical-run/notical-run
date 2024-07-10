import { Hono } from 'hono';
import { db } from '../../db';
import { desc, eq } from 'drizzle-orm';
import { User, Workspace } from '../../db/schema';
import { noteRoute } from './note/note.route';
import { privateRoute, SessionVars } from '../../auth';

export const workspaceRoute = new Hono<{ Variables: SessionVars }>()
  .route(':workspaceSlug/notes', noteRoute)
  // Private routes
  .use('*', privateRoute)
  .get(':workspaceSlug', async c => {
    const slug = c.req.param('workspaceSlug');
    const workspace = await db.query.Workspace.findFirst({
      where: eq(Workspace.slug, slug),
    });

    return c.json(workspace);
  })
  .get('/', async c => {
    const currentUser = c.get('user')!;
    const user = await db.query.User.findFirst({
      where: eq(User.id, currentUser.id),
      with: {
        workspaces: {
          with: {
            notes: { columns: { id: true, name: true } },
          },
          orderBy: [desc(Workspace.createdAt)],
          columns: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return c.json(user?.workspaces ?? []);
  });
