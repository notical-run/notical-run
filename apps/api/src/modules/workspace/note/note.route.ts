import { Hono } from 'hono';
import { privateRoute, SessionVars } from '../../../auth';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createNewNote, getNote, getWorkspaceNotes, updateNote } from './note.data';
import { authorizeWorkspace, validateWorkspace } from '../../../validators/workspace';
import { validateNote } from '../../../validators/note';

export const noteRoute = new Hono<{
  Variables: SessionVars & { workspaceId: string; noteId?: string };
}>()
  .use(validateWorkspace)

  .get('/', privateRoute, authorizeWorkspace, async c => {
    const slug = c.req.param('workspaceSlug')!;

    const workspace = await getWorkspaceNotes(slug);

    return c.json(workspace!.notes);
  })

  .get('/:noteId', validateNote, async c => {
    const slug = c.req.param('workspaceSlug')!;
    const noteId = c.req.param('noteId');

    const note = await getNote(slug, noteId);

    return c.json(note);
  })

  .post(
    '/',
    privateRoute,
    authorizeWorkspace,
    zValidator('json', z.object({ name: z.string() })),
    async c => {
      const noteJson = c.req.valid('json');
      const user = c.get('user')!;

      const note = await createNewNote({
        name: noteJson.name,
        workspaceId: c.get('workspaceId'),
        authorId: user.id,
      });

      if (!note) return c.json({ error: 'Note already exists' }, 422);

      return c.json({ id: note.id, name: note.name }, 201);
    },
  )

  .patch(
    '/:noteId',
    privateRoute,
    authorizeWorkspace,
    validateNote,
    zValidator('json', z.object({ content: z.string().optional() })),
    async c => {
      const noteId = c.get('noteId')!;
      const noteJson = c.req.valid('json');

      const note = await updateNote(noteId, noteJson);

      return c.json({ id: note.id, name: note.name }, 200);
    },
  );
