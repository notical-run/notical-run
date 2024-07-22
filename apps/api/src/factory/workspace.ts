import { db } from '../db';
import { Workspace, WorkspaceInsertType } from '../db/schema';
import { createUser } from './user';

export const workspaceFactory = async (
  workspace?: Partial<WorkspaceInsertType>,
): Promise<WorkspaceInsertType> => {
  return {
    name: 'Workspace 1',
    slug: 'workspace-1',
    ...workspace,
    authorId:
      workspace?.authorId ??
      (await createUser({ email: `wp-${crypto.randomUUID()}@email.com` })).id!,
  };
};

export const createWorkspace = async (workspace?: Partial<WorkspaceInsertType>) => {
  const newWorkspace = await db
    .insert(Workspace)
    .values(await workspaceFactory(workspace))
    .returning({
      id: Workspace.id,
      name: Workspace.name,
      slug: Workspace.slug,
      authorId: Workspace.authorId,
    });

  return newWorkspace[0];
};
