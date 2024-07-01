import { Hono } from 'hono';
import { db } from '../../../db';
import { Note, Workspace } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const noteRoute = new Hono()
  .get('/:noteId', async c => {
    const noteId = c.req.param('noteId');
    const note = await db.query.Note.findFirst({
      where: eq(Note.id, noteId),
    });

    return c.json(note);
  })
  .get('/', async c => {
    const workspaceId = c.req.param('workspaceId');
    const workspace = await db.query.Workspace.findFirst({
      where: eq(Workspace.id, workspaceId!),
      with: { notes: {} },
    });

    return c.json(workspace?.notes ?? []);
  })
  .post(c => c.text('posted workspace'));
