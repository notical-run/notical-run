import { request, context, response } from '@/utils/test';
import { createSession, createUser } from '@/factory/user';
import route from '@/index';
import { createWorkspace } from '@/factory/workspace';
import { createNote } from '@/factory/note';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { Workspace } from '@/db/schema';

request('GET /workspaces/:workspaceSlug/notes', () => {
  response.status('200', () => {
    context('when user has access to workspace', () => {
      it('returns notes belonging to the workspace', async () => {
        const user = await createUser({ email: 'author@email.com' });
        const workspace = await createWorkspace({ slug: 'wp-1', authorId: user.id });
        const workspace2 = await createWorkspace({ slug: 'wp-2', authorId: user.id });
        await createNote({ name: 'note-1', workspaceId: workspace2.id });
        await createNote({ name: 'note-2', workspaceId: workspace2.id });
        const n1 = await createNote({ name: 'note-1', workspaceId: workspace.id });
        const n2 = await createNote({ name: 'note-2', workspaceId: workspace.id });

        const session = await createSession(user.id);
        const response = await route.request('/api/workspaces/wp-1/notes', {
          method: 'GET',
          headers: { Authorization: `Bearer ${session.id}` },
        });

        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject([{ id: n2.id }, { id: n1.id }]);
      });
    });
  });

  response.status('401', () => {
    context('when user is not logged in', () => {
      it('fails with an error message', async () => {
        await createWorkspace({ slug: 'wp-1' });

        const response = await route.request('/api/workspaces/wp-1/notes', { method: 'GET' });

        expect(response.status).toBe(401);
        expect(await response.json()).toMatchObject({ error: 'Unauthenticated request' });
      });
    });

    context('when user does not have access to workspace', () => {
      it('fails with an error message', async () => {
        const user = await createUser({ email: 'author@email.com' });
        await createWorkspace({ slug: 'wp-1' });

        const session = await createSession(user.id);
        const response = await route.request('/api/workspaces/wp-1/notes', {
          method: 'GET',
          headers: { Authorization: `Bearer ${session.id}` },
        });

        expect(response.status).toBe(401);
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

        const session = await createSession(user.id);
        const response = await route.request('/api/workspaces/wp-1/notes', {
          method: 'GET',
          headers: { Authorization: `Bearer ${session.id}` },
        });

        expect(response.status).toBe(404);
        expect(await response.json()).toMatchObject({ error: 'Workspace not found' });
      });
    });
  });
});

request('POST /workspaces/:workspaceSlug/notes', () => {
  response.status('201', () => {
    context('when user has access to workspace', () => {
      it('creates a new note', async () => {
        const user = await createUser({ email: 'author@email.com' });
        const workspace = await createWorkspace({ slug: 'wp-1', authorId: user.id });

        const session = await createSession(user.id);
        await route.request('/api/workspaces/wp-1/notes', {
          method: 'POST',
          body: JSON.stringify({ name: 'new-note' }),
          headers: { Authorization: `Bearer ${session.id}`, 'Content-Type': 'application/json' },
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

        const session = await createSession(user.id);
        const response = await route.request('/api/workspaces/wp-1/notes', {
          method: 'POST',
          body: JSON.stringify({ name: 'new-note' }),
          headers: { Authorization: `Bearer ${session.id}`, 'Content-Type': 'application/json' },
        });

        expect(response.status).toBe(201);
        expect(await response.json()).toMatchObject({
          id: expect.any(String),
          name: 'new-note',
        });
      });
    });
  });

  response.status('422', () => {
    context('when a note with the same name already exists in the workspace', () => {
      it('fails with an error message', async () => {
        const user = await createUser({ email: 'author@email.com' });
        const workspace = await createWorkspace({ slug: 'wp-1', authorId: user.id });
        await createNote({ name: 'note-1', workspaceId: workspace.id });

        const session = await createSession(user.id);
        const response = await route.request('/api/workspaces/wp-1/notes', {
          method: 'POST',
          body: JSON.stringify({ name: 'note-1' }),
          headers: { Authorization: `Bearer ${session.id}`, 'Content-Type': 'application/json' },
        });

        expect(response.status).toBe(422);
        expect(await response.json()).toMatchObject({ error: 'Note already exists' });
      });
    });
  });

  response.status('401', () => {
    context('when user is not logged in', () => {
      it('fails with an error message', async () => {
        await createWorkspace({ slug: 'wp-1' });

        const response = await route.request('/api/workspaces/wp-1/notes', { method: 'POST' });

        expect(response.status).toBe(401);
        expect(await response.json()).toMatchObject({ error: 'Unauthenticated request' });
      });
    });

    context('when user does not have access to workspace', () => {
      it('fails with an error message', async () => {
        const user = await createUser({ email: 'author@email.com' });
        await createWorkspace({ slug: 'wp-1' });

        const session = await createSession(user.id);
        const response = await route.request('/api/workspaces/wp-1/notes', {
          method: 'POST',
          body: JSON.stringify({ name: 'new-note' }),
          headers: { Authorization: `Bearer ${session.id}`, 'Content-Type': 'application/json' },
        });

        expect(response.status).toBe(401);
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

        const session = await createSession(user.id);
        const response = await route.request('/api/workspaces/wp-1/notes', {
          method: 'POST',
          body: JSON.stringify({ name: 'new-note' }),
          headers: { Authorization: `Bearer ${session.id}`, 'Content-Type': 'application/json' },
        });

        expect(response.status).toBe(404);
        expect(await response.json()).toMatchObject({ error: 'Workspace not found' });
      });
    });
  });
});

request('GET /workspaces/:workspaceSlug/notes/:noteId', () => {
  response.status('200', () => {
    context('when requested note exists on the workspace', async () => {
      it('returns the note belonging to the workspace', async () => {
        const user = await createUser({ email: 'author@email.com' });
        const workspace = await createWorkspace({ slug: 'wp-1', authorId: user.id });
        const note = await createNote({ name: 'note-1', workspaceId: workspace.id });

        const session = await createSession(user.id);
        const response = await route.request('/api/workspaces/wp-1/notes/note-1', {
          method: 'GET',
          headers: { Authorization: `Bearer ${session.id}` },
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

        const session = await createSession(user.id);
        const response = await route.request('/api/workspaces/wp-1/notes/note-1', {
          method: 'GET',
          headers: { Authorization: `Bearer ${session.id}` },
        });

        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({
          id: note.id,
          name: note.name,
          author: { id: user.id },
        });
      });
    });
  });

  response.status('404', () => {
    context('when note does not exist', () => {
      it('fails with an error message', async () => {
        const user = await createUser();
        await createWorkspace({ slug: 'wp-1', authorId: user.id });

        const session = await createSession(user.id);
        const response = await route.request('/api/workspaces/wp-1/notes/random-note', {
          method: 'GET',
          headers: { Authorization: `Bearer ${session.id}` },
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

        const session = await createSession(user.id);
        const response = await route.request('/api/workspaces/wp-1/notes/note-1', {
          method: 'GET',
          headers: { Authorization: `Bearer ${session.id}` },
        });

        expect(response.status).toBe(404);
        expect(await response.json()).toMatchObject({ error: 'Note not found' });
      });
    });
  });
});
