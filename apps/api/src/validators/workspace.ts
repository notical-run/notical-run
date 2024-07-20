import { eq } from 'drizzle-orm';
import { validator } from 'hono/validator';
import { db } from '../db';
import { Workspace } from '../db/schema';

export const authorizeWorkspace = validator(
  'param',
  async (param: { workspaceSlug: string }, c) => {
    const user = c.get('user')!;
    const workspace = await db.query.Workspace.findFirst({
      where: eq(Workspace.slug, param.workspaceSlug),
      columns: { authorId: true },
    });

    if (user && workspace && workspace.authorId !== user.id)
      return c.json({ error: `You don't have access to this workspace` }, 403);

    return param;
  },
);

export const validateWorkspace = validator('param', async (param: { workspaceSlug: string }, c) => {
  if (!param.workspaceSlug) return c.json({ error: 'Empty workspace slug' }, 403);
  const workspace = await db.query.Workspace.findFirst({
    where: eq(Workspace.slug, param.workspaceSlug),
    columns: { id: true },
  });

  if (!workspace) return c.json({ error: `Workspace not found` }, 404);
  c.set('workspaceId', workspace.id);

  return param;
});
