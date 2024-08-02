import { Hono } from 'hono';
import { privateRoute, SessionVars } from '../../../auth';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createNewNote, getNote, getWorkspaceNotes, updateNote } from './note.data';
import { ownsWorkspace, validateWorkspace } from '../../../validators/workspace';
import { notePermissions, validateNote } from '../../../validators/note';
import { NoteSelectType, WorkspaceSelectType } from '../../../db/schema';
import { sql } from 'drizzle-orm';

const noteCreateSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9_-]+$/i, 'Invalid ID'),
  private: z.boolean().optional(),
});

const noteUpdateSchema = z.object({
  content: z.string().optional(),
  access: z.enum(['private', 'public']).optional(),
});

const noteFiltersSchema = z.object({
  archived: z
    .string()
    .regex(/^(true|false|1|0)$/)
    .optional()
    .transform(s => JSON.parse(s ?? 'null'))
    .catch(undefined),
  access: z.enum(['private', 'public']).optional(),
});

export const noteRoute = new Hono<{
  Variables: SessionVars & {
    workspaceId: WorkspaceSelectType['id'];
    workspace: Pick<WorkspaceSelectType, 'authorId'>;
    noteId?: NoteSelectType['id'];
  };
}>()
  .get(
    '/',
    validateWorkspace({ authorizeFor: 'view_notes' }),
    zValidator('query', noteFiltersSchema),
    async function listNotes$(c) {
      const filters = c.req.valid('query');
      const workspaceId = c.get('workspaceId');
      const workspace = c.get('workspace');
      const user = c.get('user');

      if (!ownsWorkspace(workspace, user?.id)) {
        filters.access = 'public';
      }

      const workspaceWithNotes = await getWorkspaceNotes(workspaceId, filters);

      return c.json(workspaceWithNotes!.notes);
    },
  )

  .get(
    '/:noteId',
    validateWorkspace(),
    validateNote({ authorizeFor: 'view' }),
    async function getNote$(c) {
      const user = c.get('user');
      const noteId = c.get('noteId')!;
      const workspace = c.get('workspace')!;

      const note = await getNote(noteId);

      return c.json({
        ...note!,
        permissions: {
          canEdit: notePermissions.update(workspace, note!, user?.id),
        },
      });
    },
  )

  .post(
    '/',
    privateRoute,
    validateWorkspace({ authorizeFor: 'create_notes' }),
    zValidator('json', noteCreateSchema),
    async function createNote$(c) {
      const noteJson = c.req.valid('json');
      const user = c.get('user')!;

      const note = await createNewNote({
        name: noteJson.name,
        workspaceId: c.get('workspaceId'),
        authorId: user.id,
        access: noteJson.private ? 'private' : 'public',
      });

      if (!note)
        return c.json({ error: 'Note already exists', error_code: 'note_already_exists' }, 422);

      return c.json({ id: note.id, name: note.name }, 201);
    },
  )

  .patch(
    '/:noteId',
    privateRoute,
    validateWorkspace(),
    validateNote({ authorizeFor: 'update' }),
    zValidator('json', noteUpdateSchema),
    async function updateNote$(c) {
      const noteId = c.get('noteId')!;
      const noteJson = c.req.valid('json');

      const note = await updateNote(noteId, noteJson);

      if (!note)
        return c.json({ error: 'Unable to update note', error_code: 'cant_update_note' }, 422);

      return c.json({ id: note.id, name: note.name }, 200);
    },
  )

  .post(
    '/:noteId/archive',
    privateRoute,
    validateWorkspace(),
    validateNote({ authorizeFor: 'archive' }),
    async function archiveNote$(c) {
      const noteId = c.get('noteId')!;

      const note = await updateNote(noteId, { archivedAt: sql`now()` as unknown as Date });

      if (!note)
        return c.json({ error: 'Unable to archive note', error_code: 'cant_archive_note' }, 422);

      return c.json({ success: true }, 200);
    },
  )

  .post(
    '/:noteId/unarchive',
    privateRoute,
    validateWorkspace(),
    validateNote({ authorizeFor: 'archive' }),
    async function unarchiveNote$(c) {
      const noteId = c.get('noteId')!;

      const note = await updateNote(noteId, { archivedAt: null });

      if (!note)
        return c.json(
          { error: 'Unable to unarchive note', error_code: 'cant_unarchive_note' },
          422,
        );

      return c.json({ success: true }, 200);
    },
  );
