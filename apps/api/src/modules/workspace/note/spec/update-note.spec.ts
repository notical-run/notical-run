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
      context('with contents', () => {
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

      context('with access: public', () => {
        it('makes the note public', async () => {
          const user = await createUser({ email: 'author@email.com' });
          const workspace = await createWorkspace({ slug: 'wp-1', authorId: user.id });
          const note = await createNote({
            name: 'note-1',
            content: 'current',
            workspaceId: workspace.id,
            access: 'private',
          });

          await route.request('/api/workspaces/wp-1/notes/note-1', {
            method: 'PATCH',
            body: JSON.stringify({ access: 'public' }),
            headers: await headers({ authenticatedUserId: user.id }),
          });

          const updatedNote = await db.query.Note.findFirst({ where: eq(Note.id, note.id) });
          expect(updatedNote).toMatchObject({ access: 'public' });
        });
      });

      context('with access: private', () => {
        it('makes the note public', async () => {
          const user = await createUser({ email: 'author@email.com' });
          const workspace = await createWorkspace({ slug: 'wp-1', authorId: user.id });
          const note = await createNote({
            name: 'note-1',
            content: 'current',
            workspaceId: workspace.id,
            access: 'public',
          });

          await route.request('/api/workspaces/wp-1/notes/note-1', {
            method: 'PATCH',
            body: JSON.stringify({ access: 'private' }),
            headers: await headers({ authenticatedUserId: user.id }),
          });

          const updatedNote = await db.query.Note.findFirst({ where: eq(Note.id, note.id) });
          expect(updatedNote).toMatchObject({ access: 'private' });
        });
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
        expect(await response.json()).toMatchObject({ error_code: 'unauthenticated' });
      });
    });
  });

  response.status('403', () => {
    context('when user does not have access to note', () => {
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
          error_code: 'cant_access_note',
        });
      });
    });

    context('when the note is archived', () => {
      it('fails with an error message', async () => {
        const user = await createUser({ email: 'author@email.com' });
        const workspace = await createWorkspace({ slug: 'wp-1' });
        await createNote({ name: 'note-1', workspaceId: workspace.id, archivedAt: new Date() });

        const response = await route.request('/api/workspaces/wp-1/notes/note-1', {
          method: 'PATCH',
          body: JSON.stringify({ content: 'hello' }),
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(403);
        expect(await response.json()).toMatchObject({
          error_code: 'cant_update_archived_note',
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
        expect(await response.json()).toMatchObject({ error_code: 'workspace_not_found' });
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
        expect(await response.json()).toMatchObject({ error_code: 'note_not_found' });
      });
    });
  });
});
