import { desc, eq } from 'drizzle-orm';
import { db } from '../../db';
import { User, Workspace, WorkspaceType } from '../../db/schema';

export const createWorkspace = async (payload: WorkspaceType) => {
  const workspace = await db
    .insert(Workspace)
    .values({ ...payload })
    .returning({
      id: Workspace.id,
      slug: Workspace.slug,
      name: Workspace.name,
    })
    .onConflictDoNothing();

  return workspace[0];
};

export const getUserWorkspaces = async (userId: string) => {
  const user = await db.query.User.findFirst({
    where: eq(User.id, userId),
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

  return user?.workspaces;
};
