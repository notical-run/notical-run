import { eq } from 'drizzle-orm';
import { validator } from 'hono/validator';
import { db } from '../db';
import { Note, NoteSelectType, Workspace, WorkspaceSelectType } from '../db/schema';

type Actions = 'view' | 'update' | 'archive';

export const notePermissions = {
  view: (
    workspace: Pick<WorkspaceSelectType, 'authorId'>,
    note: Pick<NoteSelectType, 'access'>,
    userId?: string,
  ) => note.access !== 'private' || workspace.authorId === userId,
  update: (
    workspace: Pick<WorkspaceSelectType, 'authorId'>,
    note: Pick<NoteSelectType, 'archivedAt'>,
    userId?: string,
  ) => Boolean(workspace.authorId === userId && !note.archivedAt),
  archive: (
    workspace: Pick<WorkspaceSelectType, 'authorId'>,
    _note: Pick<NoteSelectType, 'archivedAt'>,
    userId?: string,
  ) => workspace.authorId === userId,
} as const satisfies Record<Actions, (...args: any[]) => boolean>;

export const validateNote = (options: { authorizeFor?: Actions } = {}) =>
  validator('param', async (param: { workspaceSlug: string; noteId: string }, c) => {
    if (!param.workspaceSlug) return c.json({ error: 'Empty workspace slug' }, 403);

    const user = c.get('user');
    const workspace = await db.query.Workspace.findFirst({
      where: eq(Workspace.slug, param.workspaceSlug),
      columns: { id: true, authorId: true },
      with: {
        notes: {
          limit: 1,
          where: eq(Note.name, param.noteId),
          columns: { id: true, access: true, archivedAt: true },
        },
      },
    });

    if (!workspace?.notes[0])
      return c.json({ error: `Note not found`, error_code: 'note_not_found' }, 404);

    const note = workspace?.notes[0];

    if (options.authorizeFor === 'view') {
      if (!notePermissions.view(workspace, note, user?.id))
        return c.json(
          { error: `You don't have access to view this private note`, error_code: 'private_note' },
          403,
        );
    }

    if (options.authorizeFor === 'update') {
      if (!notePermissions.update(workspace, note, user?.id)) {
        if (note.archivedAt)
          return c.json(
            { error: `Unable to update an archived note`, error_code: 'cant_update_archived_note' },
            403,
          );
        return c.json(
          { error: `You don't have access to update this note`, error_code: 'cant_access_note' },
          403,
        );
      }
    }

    if (options.authorizeFor === 'archive') {
      if (!notePermissions.archive(workspace, note, user?.id))
        return c.json(
          { error: `You don't have access to this note`, error_code: 'cant_archive_note' },
          403,
        );
    }

    c.set('noteId', note.id);

    return param;
  });
