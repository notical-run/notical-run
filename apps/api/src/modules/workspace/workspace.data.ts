import { and, count, desc, eq, isNull } from 'drizzle-orm';
import { db } from '../../db';
import { Note, Workspace, WorkspaceType } from '../../db/schema';

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
  const workspaces = await db
    .select({
      id: Workspace.id,
      name: Workspace.name,
      slug: Workspace.slug,
      createdAt: Workspace.createdAt,
      notesCount: count(Note.id).as('noteCount'),
    })
    .from(Workspace)
    .where(eq(Workspace.authorId, userId))
    .leftJoin(Note, and(eq(Note.workspaceId, Workspace.id), isNull(Note.archivedAt)))
    .groupBy(Workspace.id)
    .orderBy(desc(Workspace.createdAt))
    .execute();

  return workspaces;
};
