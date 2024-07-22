import { eq } from 'drizzle-orm';
import { validator } from 'hono/validator';
import { db } from '../db';
import { Note, Workspace } from '../db/schema';

type Actions = 'read' | 'update' | 'archive';

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

    if (!workspace?.notes[0]) return c.json({ error: `Note not found` }, 404);

    const note = workspace?.notes[0];

    if (options.authorizeFor === 'read') {
      if (workspace?.notes[0].access === 'private' && workspace?.authorId !== user?.id)
        return c.json({ error: `You don't have access to view this private note` }, 403);
    }

    if (options.authorizeFor === 'update') {
      if (workspace?.authorId !== user?.id)
        return c.json({ error: `You don't have access to update this note` }, 403);

      if (note.archivedAt) return c.json({ error: `Unable to update an archived note` }, 403);
    }

    if (options.authorizeFor === 'archive') {
      if (user && workspace && workspace.authorId !== user?.id)
        return c.json({ error: `You don't have access to this workspace` }, 403);
    }

    c.set('noteId', note.id);

    return param;
  });
