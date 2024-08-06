import { eq } from 'drizzle-orm';
import { db } from '../db';
import { Note, NoteInsertType, Workspace } from '../db/schema';
import { createWorkspace } from './workspace';

export const noteFactory = async (note?: Partial<NoteInsertType>): Promise<NoteInsertType> => {
  const tempWorkspace = note?.workspaceId
    ? await db.query.Workspace.findFirst({ where: eq(Workspace.id, note?.workspaceId) })
    : await createWorkspace();

  return {
    name: 'note-default-' + crypto.randomUUID(),
    content: '',
    ...note,
    workspaceId: note?.workspaceId ?? tempWorkspace?.id ?? '',
    authorId: note?.authorId ?? tempWorkspace?.authorId ?? '',
  };
};

export const createNote = async (note?: Partial<NoteInsertType>) => {
  const newNote = await db
    .insert(Note)
    .values(await noteFactory(note))
    .returning({ id: Note.id, name: Note.name, content: Note.content });

  return newNote[0];
};
