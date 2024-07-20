import { desc, eq, sql } from 'drizzle-orm';
import { db } from '../../../db';
import { Workspace, Note, NoteType } from '../../../db/schema';

export const getNote = async (workspaceSlug: string, noteId: string) => {
  const workspace = await db.query.Workspace.findFirst({
    where: eq(Workspace.slug, workspaceSlug),
    with: {
      notes: {
        limit: 1,
        where: eq(Note.name, noteId),
        columns: {
          id: true,
          name: true,
          content: true,
          access: true,
          createdAt: true,
          updatedAt: true,
        },
        with: {
          author: {
            columns: { id: true, name: true },
          },
        },
      },
    },
  });

  return workspace?.notes[0];
};

export const getWorkspaceNotes = async (workspaceSlug: string) => {
  return db.query.Workspace.findFirst({
    where: eq(Workspace.slug, workspaceSlug),
    columns: { id: true },
    with: {
      notes: {
        orderBy: desc(Note.updatedAt),
        columns: {
          id: true,
          name: true,
          access: true,
          createdAt: true,
          updatedAt: true,
        },
        with: {
          author: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
};

export const createNewNote = async (note: NoteType) => {
  const insertedNotes = await db
    .insert(Note)
    .values(note)
    .returning({ id: Note.id, name: Note.name })
    .onConflictDoNothing();

  return insertedNotes[0] ?? null;
};

export const updateNote = async (
  noteId: string,
  update: Partial<Omit<NoteType, 'id' | 'name'>>,
) => {
  const updatedNotes = await db
    .update(Note)
    .set({ ...update, updatedAt: sql`now()` })
    .where(eq(Note.id, noteId))
    .returning({ id: Note.id, name: Note.name, contents: Note.content });

  return updatedNotes[0] ?? null;
};
