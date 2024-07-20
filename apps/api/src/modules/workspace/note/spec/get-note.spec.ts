import { request, context, response, headers } from '../../../../utils/test';
import { createUser } from '../../../../factory/user';
import route from '../../../../index';
import { createWorkspace } from '../../../../factory/workspace';
import { createNote } from '../../../../factory/note';

request('GET /workspaces/:workspaceSlug/notes/:noteId', () => {
  response.status('200', () => {
    context('when requested note exists on the workspace', async () => {
      it('returns the note belonging to the workspace', async () => {
        const user = await createUser({ email: 'author@email.com' });
        const workspace = await createWorkspace({ slug: 'wp-1', authorId: user.id });
        const note = await createNote({ name: 'note-1', workspaceId: workspace.id });

        const response = await route.request('/api/workspaces/wp-1/notes/note-1', {
          method: 'GET',
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({
          id: note.id,
          name: note.name,
          author: { id: user.id },
        });
      });
    });

    context('when there are multiple notes with the same name', async () => {
      it('returns the note belonging to the workspace', async () => {
        const user = await createUser({ email: 'author@email.com' });
        const workspace = await createWorkspace({ slug: 'wp-1', authorId: user.id });
        const workspace2 = await createWorkspace({ slug: 'wp-2', authorId: user.id });
        const note = await createNote({ name: 'note-1', workspaceId: workspace.id });
        await createNote({ name: 'note-1', workspaceId: workspace2.id });

        const response = await route.request('/api/workspaces/wp-1/notes/note-1', {
          method: 'GET',
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({
          id: note.id,
          name: note.name,
          author: { id: user.id },
        });
      });
    });

    context('when a different user tries to access a public note', async () => {
      it('returns the note', async () => {
        const author = await createUser({ email: 'author@email.com' });
        const reader = await createUser({ email: 'reader@email.com' });
        const workspace = await createWorkspace({ slug: 'wp-1', authorId: author.id });
        const note = await createNote({
          name: 'note-1',
          workspaceId: workspace.id,
          access: 'public',
        });

        const response = await route.request('/api/workspaces/wp-1/notes/note-1', {
          method: 'GET',
          headers: await headers({ authenticatedUserId: reader.id }),
        });

        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({
          id: note.id,
          name: note.name,
          author: { id: author.id },
        });
      });
    });
  });

  response.status('404', () => {
    context('when note does not exist', () => {
      it('fails with an error message', async () => {
        const user = await createUser();
        await createWorkspace({ slug: 'wp-1', authorId: user.id });

        const response = await route.request('/api/workspaces/wp-1/notes/random-note', {
          method: 'GET',
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(404);
        expect(await response.json()).toMatchObject({ error: 'Note not found' });
      });
    });

    context('when note does not exist on the requested workspace', () => {
      it('fails with an error message', async () => {
        const user = await createUser();
        await createWorkspace({ slug: 'wp-1', authorId: user.id });
        const workspace2 = await createWorkspace({ slug: 'wp-2', authorId: user.id });
        await createNote({ name: 'note-1', workspaceId: workspace2.id });

        const response = await route.request('/api/workspaces/wp-1/notes/note-1', {
          method: 'GET',
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(404);
        expect(await response.json()).toMatchObject({ error: 'Note not found' });
      });
    });
  });

  response.status('403', () => {
    context('when a different user tries to access a private note', async () => {
      it('returns the note', async () => {
        const author = await createUser({ email: 'author@email.com' });
        const reader = await createUser({ email: 'reader@email.com' });
        const workspace = await createWorkspace({ slug: 'wp-1', authorId: author.id });
        await createNote({
          name: 'note-1',
          workspaceId: workspace.id,
          access: 'private',
        });

        const response = await route.request('/api/workspaces/wp-1/notes/note-1', {
          method: 'GET',
          headers: await headers({ authenticatedUserId: reader.id }),
        });

        expect(response.status).toBe(403);
        expect(await response.json()).toMatchObject({
          error: `You don't have access to view this private note`,
        });
      });
    });
  });
});
