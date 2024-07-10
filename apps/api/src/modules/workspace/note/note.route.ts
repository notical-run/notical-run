import { Hono } from 'hono';
import { db } from '../../../db';
import { Note, Workspace } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { privateRoute } from '../../../auth';

export const noteRoute = new Hono()
  .get('/:noteId', async c => {
    const noteId = c.req.param('noteId');
    const note = await db.query.Note.findFirst({
      where: eq(Note.id, noteId),
      columns: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      with: {
        author: {},
      },
    });

    if (!note) return c.json({ error: 'Note not found' }, 404);

    return c.json(note);
  })
  // Private routes
  .use('*', privateRoute)
  .get('/', async c => {
    const slug = c.req.param('workspaceSlug')!;
    const workspace = await db.query.Workspace.findFirst({
      where: eq(Workspace.slug, slug!),
      with: {
        notes: {
          columns: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
          with: {
            author: {},
          },
        },
      },
    });

    return c.json(workspace?.notes ?? []);
  })
  .post(c => c.text('posted workspace'));
