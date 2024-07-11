import { Hono } from 'hono';
import { db } from '../../../db';
import { Note, Workspace } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { privateRoute, SessionVars } from '../../../auth';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

export const noteRoute = new Hono<{ Variables: SessionVars }>()
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
  .post('/', zValidator('json', z.object({ name: z.string() })), async c => {
    const noteJson = c.req.valid('json');
    const user = c.get('user')!;
    const workspace = await db.query.Workspace.findFirst({
      where: eq(Workspace.slug, c.req.param('workspaceSlug')!),
      columns: { id: true },
    });
    if (!workspace) return c.json({ error: 'Workspace not found' }, 404);

    await db
      .insert(Note)
      .values({
        name: noteJson.name,
        workspaceId: workspace.id,
        authorId: user.id,
      })
      .returning({ id: Note.id, name: Note.name });
    return c.json({}, 201);
  });
