import { Hono } from 'hono';
import { db } from '../../../db';
import { Note, Workspace } from '../../../db/schema';
import { and, desc, eq, sql } from 'drizzle-orm';
import { privateRoute, SessionVars } from '../../../auth';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

import { validator } from 'hono/validator';

const authorizeWorkspace = validator(
  'param',
  async (param: { workspaceSlug: string }, c) => {
    if (!param.workspaceSlug) return c.json({ error: 'Empty workspace' }, 401);
    const user = c.get('user')!;
    const workspace = await db.query.Workspace.findFirst({
      where: and(
        eq(Workspace.slug, param.workspaceSlug),
        eq(Workspace.authorId, user.id),
      ),
    });

    if (!workspace)
      return c.json({ error: `You don't have access to this workspace` }, 401);

    return { param };
  },
);

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
            content: true,
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

  .get('/', authorizeWorkspace, async c => {
    const slug = c.req.param('workspaceSlug')!;
    const workspace = await db.query.Workspace.findFirst({
      where: eq(Workspace.slug, slug!),
      with: {
        notes: {
          orderBy: desc(Note.updatedAt),
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

  .post(
    '/',
    authorizeWorkspace,
    zValidator('json', z.object({ name: z.string() })),
    async c => {
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
    },
  )

  .patch(
    '/:noteId',
    authorizeWorkspace,
    zValidator(
      'json',
      z.object({
        name: z.string().optional(),
        content: z.string().optional(),
      }),
    ),
    async c => {
      const workspaceSlug = c.req.param('workspaceSlug')!;
      const noteId = c.req.param('noteId');
      const noteJson = c.req.valid('json');
      // const user = c.get('user')!;
      // TODO: Authorize

      const workspace = await db.query.Workspace.findFirst({
        where: eq(Workspace.slug, workspaceSlug),
        columns: { id: true },
        with: {
          notes: {
            limit: 1,
            where: eq(Note.name, noteId),
            columns: { id: true },
          },
        },
      });
      if (!workspace?.notes[0].id) return c.json({ error: 'Not found' }, 404);

      const result = await db
        .update(Note)
        .set({ ...noteJson, updatedAt: sql`now()` })
        .where(eq(Note.id, workspace.notes[0].id))
        .returning({ id: Note.id, name: Note.name, contents: Note.content });

      return c.json(result[0], 200);
    },
  );
