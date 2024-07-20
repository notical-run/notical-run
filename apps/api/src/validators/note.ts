import { eq } from 'drizzle-orm';
import { validator } from 'hono/validator';
import { db } from '../db';
import { Note, Workspace } from '../db/schema';

export const validateNote = validator(
  'param',
  async (param: { workspaceSlug: string; noteId: string }, c) => {
    if (!param.workspaceSlug) return c.json({ error: 'Empty workspace slug' }, 403);

    const workspace = await db.query.Workspace.findFirst({
      where: eq(Workspace.slug, param.workspaceSlug),
      columns: { id: true },
      with: {
        notes: {
          limit: 1,
          where: eq(Note.name, param.noteId),
          columns: { id: true },
        },
      },
    });

    if (!workspace?.notes[0]) return c.json({ error: `Note not found` }, 404);

    c.set('noteId', workspace?.notes[0].id);

    return param;
  },
);
