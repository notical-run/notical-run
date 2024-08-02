import { and, count, desc, eq, isNull, sql } from 'drizzle-orm';
import { db } from '../../db';
import { Note, Workspace, WorkspaceInsertType, WorkspaceSelectType } from '../../db/schema';

export const createWorkspace = async (payload: WorkspaceInsertType) => {
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
  const workspaces = await db
    .select({
      id: Workspace.id,
      name: Workspace.name,
      slug: Workspace.slug,
      createdAt: Workspace.createdAt,
      notesCount: count(Note.id).as('noteCount'),
      access: Workspace.access,
    })
    .from(Workspace)
    .where(eq(Workspace.authorId, userId))
    .leftJoin(Note, and(eq(Note.workspaceId, Workspace.id), isNull(Note.archivedAt)))
    .groupBy(Workspace.id)
    .orderBy(desc(Workspace.createdAt))
    .execute();

  return workspaces;
};

export const getWorkspace = async (workspaceID: string) => {
  const workspace = await db.query.Workspace.findFirst({
    where: eq(Workspace.id, workspaceID),
    columns: {
      id: true,
      slug: true,
      name: true,
      authorId: true,
      access: true,
    },
  });

  return workspace;
};

export const updateWorkspace = async (
  workspaceId: WorkspaceSelectType['id'],
  payload: Partial<WorkspaceInsertType>,
) => {
  const workspace = await db
    .update(Workspace)
    .set({ ...payload, updatedAt: sql`now()` })
    .where(eq(Workspace.id, workspaceId))
    .returning({
      id: Workspace.id,
      slug: Workspace.slug,
    })
    .execute();

  return workspace[0];
};
