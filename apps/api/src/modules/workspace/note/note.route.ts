import { Hono } from 'hono';
import { db } from '../../../db';
import { Note, Workspace } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { privateRoute } from '../../../auth';

export const noteRoute = new Hono()
  .get('/:noteId', async c => {
    const slug = c.req.param('workspaceSlug')!;
    const noteId = c.req.param('noteId');
    const workspace = await db.query.Workspace.findFirst({
      where: eq(Workspace.slug, slug),
      with: {
        notes: {
          limit: 1,
          where: eq(Note.name, noteId),
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

    if (!workspace?.notes[0]) return c.json({ error: 'Note not found' }, 404);

    return c.json(workspace?.notes[0]);
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
