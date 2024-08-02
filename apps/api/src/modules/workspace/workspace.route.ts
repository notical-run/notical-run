import { Hono } from 'hono';
import { noteRoute } from './note/note.route';
import { privateRoute, SessionVars } from '../../auth';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import {
  createWorkspace,
  getUserWorkspaces,
  getWorkspace,
  updateWorkspace,
} from './workspace.data';
import { WorkspaceSelectType } from '../../db/schema';
import { workspacePermissions, validateWorkspace } from '../../validators/workspace';

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9_-]+$/, 'Invalid slug'),
  access: z.enum(['private', 'public']).optional(),
});

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  access: z.enum(['private', 'public']).optional(),
});

export const workspaceRoute = new Hono<{
  Variables: SessionVars & { workspaceId?: WorkspaceSelectType['id'] };
}>()
  .route(':workspaceSlug/notes', noteRoute)

  .post(
    '/',
    privateRoute,
    zValidator('json', createWorkspaceSchema),
    async function createWorkspace$(c) {
      const workspaceJson = c.req.valid('json');
      const user = c.get('user')!;
      const workspace = await createWorkspace({
        ...workspaceJson,
        authorId: user.id,
      });

      if (!workspace)
        return c.json(
          { error: 'Workspace already exists', error_code: 'workspace_aleady_exists' },
          422,
        );
      return c.json(workspace, 201);
    },
  )

  .get('/', privateRoute, async function listWorkspaces$(c) {
    const currentUser = c.get('user')!;
    const workspaces = await getUserWorkspaces(currentUser.id);
    return c.json(workspaces ?? []);
  })

  .get(
    '/:workspaceSlug',
    validateWorkspace({ authorizeFor: 'view' }),
    async function getWorkspace$(c) {
      const currentUser = c.get('user')!;
      const workspaceId = c.get('workspaceId')!;
      const workspace = await getWorkspace(workspaceId);
      const permissions = {
        canViewNotes: workspacePermissions.view_notes(workspace!, currentUser?.id),
        canCreateNotes: workspacePermissions.create_notes(workspace!, currentUser?.id),
        canManage: workspacePermissions.manage(workspace!, currentUser?.id),
      };
      return c.json({ ...workspace!, permissions });
    },
  )

  .patch(
    '/:workspaceSlug',
    privateRoute,
    validateWorkspace({ authorizeFor: 'update' }),
    zValidator('json', updateWorkspaceSchema),
    async function createWorkspace$(c) {
      const workspaceJson = c.req.valid('json');
      const workspaceId = c.get('workspaceId');

      const workspace = await updateWorkspace(workspaceId!, workspaceJson);

      if (!workspace)
        return c.json(
          { error: 'Unable to update workspace', error_code: 'unable_to_update_workspace' },
          422,
        );

      return c.json(workspace, 200);
    },
  );
