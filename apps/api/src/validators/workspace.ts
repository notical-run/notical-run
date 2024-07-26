import { eq } from 'drizzle-orm';
import { validator } from 'hono/validator';
import { db } from '../db';
import { Workspace, WorkspaceSelectType } from '../db/schema';

type Actions = 'view' | 'view_notes' | 'create_notes';

export const workspacePermissions = {
  view: (workspace: Pick<WorkspaceSelectType, 'authorId'>, userId?: string) =>
    Boolean(userId && workspace.authorId == userId),

  view_notes: (workspace: Pick<WorkspaceSelectType, 'authorId'>, userId?: string) =>
    Boolean(userId && workspace.authorId == userId),

  create_notes: (workspace: Pick<WorkspaceSelectType, 'authorId'>, userId?: string) =>
    Boolean(userId && workspace.authorId == userId),
} as const satisfies Record<Actions, (...args: any[]) => boolean>;

export const validateWorkspace = (options: { authorizeFor?: Actions } = {}) =>
  validator('param', async (param: { workspaceSlug: string }, c) => {
    if (!param.workspaceSlug) return c.json({ error: 'Empty workspace slug' }, 403);

    const user = c.get('user');
    const workspace = await db.query.Workspace.findFirst({
      where: eq(Workspace.slug, param.workspaceSlug),
      columns: { id: true, authorId: true },
    });

    if (!workspace)
      return c.json({ error: `Workspace not found`, error_code: 'workspace_not_found' }, 404);

    if (options.authorizeFor === 'view') {
      if (!workspacePermissions.view(workspace!, user.id))
        return c.json(
          { error: `You don't have access to this workspace`, error_code: 'cant_access_workspace' },
          403,
        );
    }

    if (options.authorizeFor === 'view_notes') {
      if (!workspacePermissions.view_notes(workspace!, user.id))
        return c.json(
          { error: `You don't have access to this workspace`, error_code: 'cant_access_workspace' },
          403,
        );
    }

    if (options.authorizeFor === 'create_notes') {
      if (!workspacePermissions.create_notes(workspace!, user.id))
        return c.json(
          { error: `You don't have access to this workspace`, error_code: 'cant_access_workspace' },
          403,
        );
    }

    c.set('workspaceId', workspace.id);
    c.set('workspace', workspace);

    return param;
  });
