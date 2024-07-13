import { request, context, response } from '@/utils/test';
import { createSession, createUser } from '@/factory/user';
import route from '@/index';
import { createWorkspace } from '@/factory/workspace';
import { createNote } from '@/factory/note';

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
