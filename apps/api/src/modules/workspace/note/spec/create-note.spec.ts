import { request, context, response, headers } from '../../../../utils/test';
import { createUser } from '../../../../factory/user';
import route from '../../../../index';
import { createWorkspace } from '../../../../factory/workspace';
import { createNote } from '../../../../factory/note';
import { db } from '../../../../db';
import { eq } from 'drizzle-orm';
import { Workspace } from '../../../../db/schema';

request('POST /workspaces/:workspaceSlug/notes', () => {
  response.status('201', () => {
    context('when user has access to workspace', () => {
      it('creates a new note', async () => {
        const user = await createUser({ email: 'author@email.com' });
        const workspace = await createWorkspace({ slug: 'wp-1', authorId: user.id });

        await route.request('/api/workspaces/wp-1/notes', {
          method: 'POST',
          body: JSON.stringify({ name: 'new-note' }),
          headers: await headers({ authenticatedUserId: user.id }),
        });

        const workspaceNotes = await db.query.Workspace.findFirst({
          where: eq(Workspace.id, workspace.id),
          with: { notes: { columns: { name: true } } },
        });
        expect(workspaceNotes?.notes).toMatchObject([{ name: 'new-note' }]);
      });

      it('returns the new note back', async () => {
        const user = await createUser({ email: 'author@email.com' });
        await createWorkspace({ slug: 'wp-1', authorId: user.id });

        const response = await route.request('/api/workspaces/wp-1/notes', {
          method: 'POST',
          body: JSON.stringify({ name: 'new-note' }),
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(201);
        expect(await response.json()).toMatchObject({
          id: expect.any(String),
          name: 'new-note',
        });
      });
    });
  });

  response.status('400', () => {
    context('when the note name is not present or empty', () => {
      it('fails with an error', async () => {
        const user = await createUser({ email: 'author@email.com' });
        await createWorkspace({ slug: 'wp-1', authorId: user.id });

        const response = await route.request('/api/workspaces/wp-1/notes', {
          method: 'POST',
          body: JSON.stringify({ name: '' }),
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({ error: { name: 'ZodError' } });
      });
    });

    context('when the note name contains invalid characters', () => {
      const names = ['hello world', 'he$$o', 'foo*1', 'p@lo'];
      it.each(names)('fails with an error for "%s"', async name => {
        const user = await createUser({ email: 'author@email.com' });
        await createWorkspace({ slug: 'wp-1', authorId: user.id });

        const response = await route.request('/api/workspaces/wp-1/notes', {
          method: 'POST',
          body: JSON.stringify({ name }),
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({ error: { name: 'ZodError' } });
      });
    });
  });

  response.status('422', () => {
    context('when a note with the same name already exists in the workspace', () => {
      it('fails with an error message', async () => {
        const user = await createUser({ email: 'author@email.com' });
        const workspace = await createWorkspace({ slug: 'wp-1', authorId: user.id });
        await createNote({ name: 'note-1', workspaceId: workspace.id });

        const response = await route.request('/api/workspaces/wp-1/notes', {
          method: 'POST',
          body: JSON.stringify({ name: 'note-1' }),
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(422);
        expect(await response.json()).toMatchObject({ error_code: 'note_already_exists' });
      });
    });
  });

  response.status('401', () => {
    context('when user is not logged in', () => {
      it('fails with an error message', async () => {
        await createWorkspace({ slug: 'wp-1' });

        const response = await route.request('/api/workspaces/wp-1/notes', { method: 'POST' });

        expect(response.status).toBe(401);
        expect(await response.json()).toMatchObject({ error_code: 'unauthenticated' });
      });
    });
  });

  response.status('403', () => {
    context('when user does not have access to workspace', () => {
      it('fails with an error message', async () => {
        const user = await createUser({ email: 'author@email.com' });
        await createWorkspace({ slug: 'wp-1' });

        const response = await route.request('/api/workspaces/wp-1/notes', {
          method: 'POST',
          body: JSON.stringify({ name: 'new-note' }),
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(403);
        expect(await response.json()).toMatchObject({
          error_code: 'cant_access_workspace',
        });
      });
    });
  });

  response.status('404', () => {
    context('when workspace does not exist', () => {
      it('fails with an error message', async () => {
        const user = await createUser();

        const response = await route.request('/api/workspaces/wp-1/notes', {
          method: 'POST',
          body: JSON.stringify({ name: 'new-note' }),
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(404);
        expect(await response.json()).toMatchObject({ error_code: 'workspace_not_found' });
      });
    });
  });
});
