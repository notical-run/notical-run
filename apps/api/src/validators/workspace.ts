import { eq } from 'drizzle-orm';
import { validator } from 'hono/validator';
import { db } from '../db';
import { Workspace, WorkspaceSelectType } from '../db/schema';

type Actions = 'view' | 'view_notes' | 'create_notes' | 'update' | 'manage';

export const ownsWorkspace = (
  workspace: Pick<WorkspaceSelectType, 'authorId'>,
  userId?: string,
) => {
  return Boolean(userId && workspace.authorId == userId);
};

export const workspacePermissions = {
  view: (workspace: Pick<WorkspaceSelectType, 'authorId' | 'access'>, userId?: string) => {
    if (workspace.access === 'public') return true;
    return ownsWorkspace(workspace, userId);
  },

  view_notes: (workspace: Pick<WorkspaceSelectType, 'authorId' | 'access'>, userId?: string) => {
    if (workspace.access === 'public') return true;
    return ownsWorkspace(workspace, userId);
  },

  create_notes: (workspace: Pick<WorkspaceSelectType, 'authorId'>, userId?: string) =>
    ownsWorkspace(workspace, userId),

  update: (workspace: Pick<WorkspaceSelectType, 'authorId'>, userId?: string) =>
    ownsWorkspace(workspace, userId),

  manage: (workspace: Pick<WorkspaceSelectType, 'authorId'>, userId?: string) =>
    ownsWorkspace(workspace, userId),
} as const satisfies Record<Actions, (...args: any[]) => boolean>;

export const validateWorkspace = (options: { authorizeFor?: Actions } = {}) =>
  validator('param', async (param: { workspaceSlug: string }, c) => {
    if (!param.workspaceSlug) return c.json({ error: 'Empty workspace slug' }, 403);

    const user = c.get('user');
    const workspace = await db.query.Workspace.findFirst({
      where: eq(Workspace.slug, param.workspaceSlug),
      columns: { id: true, authorId: true, access: true },
    });

    if (!workspace)
      return c.json({ error: `Workspace not found`, error_code: 'workspace_not_found' }, 404);

    if (options.authorizeFor) {
      const isAuthorized = workspacePermissions[options.authorizeFor](workspace!, user?.id);
      if (!isAuthorized) {
        return c.json(
          { error: `You don't have access to this workspace`, error_code: 'cant_access_workspace' },
          403,
        );
      }
    }

    c.set('workspaceId', workspace.id);
    c.set('workspace', workspace);

    return param;
  });
