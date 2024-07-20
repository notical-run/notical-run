import { Hono } from 'hono';
import { privateRoute, SessionVars } from '../../../auth';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createNewNote, getNote, getWorkspaceNotes, updateNote } from './note.data';
import { validateWorkspace } from '../../../validators/workspace';
import { validateNote } from '../../../validators/note';

const noteCreateSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9_-]+$/, 'Invalid ID'),
  private: z.boolean().optional(),
});

const noteUpdateSchema = z.object({ content: z.string().optional() });

export const noteRoute = new Hono<{
  Variables: SessionVars & { workspaceId: string; noteId?: string };
}>()
  .get('/', privateRoute, validateWorkspace({ authorize: true }), async c => {
    const slug = c.req.param('workspaceSlug')!;

    const workspace = await getWorkspaceNotes(slug);

    return c.json(workspace!.notes);
  })

  .get('/:noteId', validateWorkspace(), validateNote({ authorize: true }), async c => {
    const user = c.get('user');
    const slug = c.req.param('workspaceSlug')!;
    const noteId = c.req.param('noteId');

    const note = await getNote(slug, noteId);

    return c.json({
      ...note!,
      permissions: {
        canEdit: note?.author.id === user?.id,
      },
    });
  })

  .post(
    '/',
    privateRoute,
    validateWorkspace({ authorize: true }),
    zValidator('json', noteCreateSchema),
    async c => {
      const noteJson = c.req.valid('json');
      const user = c.get('user')!;

      const note = await createNewNote({
        name: noteJson.name,
        workspaceId: c.get('workspaceId'),
        authorId: user.id,
        access: noteJson.private ? 'private' : 'public',
      });

      if (!note) return c.json({ error: 'Note already exists' }, 422);

      return c.json({ id: note.id, name: note.name }, 201);
    },
  )

  .patch(
    '/:noteId',
    privateRoute,
    validateWorkspace({ authorize: true }),
    validateNote(),
    zValidator('json', noteUpdateSchema),
    async c => {
      const noteId = c.get('noteId')!;
      const noteJson = c.req.valid('json');

      const note = await updateNote(noteId, noteJson);

      return c.json({ id: note.id, name: note.name }, 200);
    },
  );
