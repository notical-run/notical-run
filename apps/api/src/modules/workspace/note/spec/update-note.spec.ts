import { request, context, response, headers } from '../../../../utils/test';
import { createUser } from '../../../../factory/user';
import route from '../../../../index';
import { createWorkspace } from '../../../../factory/workspace';
import { createNote } from '../../../../factory/note';
import { db } from '../../../../db';
import { eq } from 'drizzle-orm';
import { Note } from '../../../../db/schema';

request('PATCH /workspaces/:workspaceSlug/notes/:noteId', () => {
  response.status('200', () => {
    context('when user has access to workspace', () => {
      it('updates note contents', async () => {
        const user = await createUser({ email: 'author@email.com' });
        const workspace = await createWorkspace({ slug: 'wp-1', authorId: user.id });
        const note = await createNote({
          name: 'note-1',
          content: 'current',
          workspaceId: workspace.id,
        });

        await route.request('/api/workspaces/wp-1/notes/note-1', {
          method: 'PATCH',
          body: JSON.stringify({ content: 'new content' }),
          headers: await headers({ authenticatedUserId: user.id }),
        });

        const updatedNote = await db.query.Note.findFirst({ where: eq(Note.id, note.id) });
        expect(updatedNote).toMatchObject({ content: 'new content' });
      });
    });
  });

  response.status('401', () => {
    context('when user is not logged in', () => {
      it('fails with an error message', async () => {
        const workspace = await createWorkspace({ slug: 'wp-1' });
        await createNote({ name: 'note-1', workspaceId: workspace.id });

        const response = await route.request('/api/workspaces/wp-1/notes/note-1', {
          method: 'PATCH',
          headers: await headers(),
        });

        expect(response.status).toBe(401);
        expect(await response.json()).toMatchObject({ error: 'Unauthenticated request' });
      });
    });
  });

  response.status('403', () => {
    context('when user does not have access to workspace', () => {
      it('fails with an error message', async () => {
        const user = await createUser({ email: 'author@email.com' });
        const workspace = await createWorkspace({ slug: 'wp-1' });
        await createNote({ name: 'note-1', workspaceId: workspace.id });

        const response = await route.request('/api/workspaces/wp-1/notes/note-1', {
          method: 'PATCH',
          body: JSON.stringify({ content: 'hello' }),
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(403);
        expect(await response.json()).toMatchObject({
          error: `You don't have access to this workspace`,
        });
      });
    });
  });

  response.status('404', () => {
    context('when workspace does not exist', () => {
      it('fails with an error message', async () => {
        const user = await createUser();
        await createNote({ name: 'note-1', authorId: user.id });

        const response = await route.request('/api/workspaces/wp-1/notes/note-1', {
          method: 'PATCH',
          body: JSON.stringify({ name: 'new-note' }),
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(404);
        expect(await response.json()).toMatchObject({ error: 'Workspace not found' });
      });
    });

    context('when note does not exist', () => {
      it('fails with an error message', async () => {
        const user = await createUser();
        await createWorkspace({ slug: 'wp-1', authorId: user.id });

        const response = await route.request('/api/workspaces/wp-1/notes/note-1', {
          method: 'PATCH',
          body: JSON.stringify({ name: 'new-note' }),
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(404);
        expect(await response.json()).toMatchObject({ error: 'Note not found' });
      });
    });
  });
});
