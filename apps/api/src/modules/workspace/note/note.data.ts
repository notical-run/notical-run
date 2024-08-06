import { and, desc, eq, ilike, isNotNull, isNull, sql } from 'drizzle-orm';
import { db } from '../../../db';
import {
  Workspace,
  Note,
  NoteInsertType,
  NoteSelectType,
  WorkspaceSelectType,
} from '../../../db/schema';

export const getNote = async (noteId: NoteSelectType['id']) => {
  const note = await db.query.Note.findFirst({
    where: eq(Note.id, noteId),
    columns: {
      id: true,
      name: true,
      content: true,
      defaultMarkdownContent: true,
      access: true,
      createdAt: true,
      updatedAt: true,
      archivedAt: true,
    },
    with: {
      author: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  });

  return note;
};

export type NoteFilters = {
  archived?: boolean;
  access?: NoteSelectType['access'];
  nameSearch?: string;
};

const noteFiltersToCondition = (filters: NoteFilters) => {
  const cond = [];

  if (filters.archived) {
    cond.push(isNotNull(Note.archivedAt));
  } else if (filters.archived === false) {
    cond.push(isNull(Note.archivedAt));
  }

  if (filters.access) {
    cond.push(eq(Note.access, filters.access));
  }

  if (filters.nameSearch) {
    const searchText = filters.nameSearch.replace(/[%_]/g, '');
    cond.push(ilike(Note.name, `%${searchText}%`));
  }

  if (cond.length === 0) return undefined;
  return and(...cond);
};

export const getWorkspaceNotes = async (
  workspaceId: WorkspaceSelectType['id'],
  filters: NoteFilters = {},
) => {
  const cond = noteFiltersToCondition(filters);

  return db.query.Workspace.findFirst({
    where: eq(Workspace.id, workspaceId),
    columns: { id: true },
    with: {
      notes: {
        orderBy: desc(Note.updatedAt),
        where: cond,
        columns: {
          id: true,
          name: true,
          access: true,
          createdAt: true,
          updatedAt: true,
          archivedAt: true,
        },
        with: {
          author: {
            columns: {
              id: true,
              name: true,
            },
          },
          workspace: {
            columns: {
              id: true,
              slug: true,
            },
          },
        },
      },
    },
  });
};

export const createNewNote = async (note: NoteInsertType) => {
  const insertedNotes = await db
    .insert(Note)
    .values(note)
    .returning({ id: Note.id, name: Note.name })
    .onConflictDoNothing();

  return insertedNotes[0] ?? null;
};

export const updateNote = async (
  noteId: string,
  update: Partial<Omit<NoteInsertType, 'id' | 'name'>>,
) => {
  const updatedNotes = await db
    .update(Note)
    .set({ ...update, updatedAt: sql`now()` })
    .where(eq(Note.id, noteId))
    .returning({ id: Note.id, name: Note.name, contents: Note.content });

  return updatedNotes[0] ?? null;
};
