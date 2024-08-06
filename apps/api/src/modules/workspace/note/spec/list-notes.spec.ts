import { request, context, response, headers } from '../../../../utils/test';
import { createUser } from '../../../../factory/user';
import route from '../../../../index';
import { createWorkspace } from '../../../../factory/workspace';
import { createNote } from '../../../../factory/note';

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

        const response = await route.request('/api/workspaces/wp-1/notes', {
          method: 'GET',
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject([{ id: n2.id }, { id: n1.id }]);
      });
    });

    context('with filter archived', () => {
      context('when archived is false', () => {
        it('returns unarchived notes from the workspace', async () => {
          const user = await createUser({ email: 'author@email.com' });
          const workspace = await createWorkspace({ slug: 'wp-1', authorId: user.id });
          const workspace2 = await createWorkspace({ slug: 'wp-2', authorId: user.id });
          await createNote({ name: 'note-1', workspaceId: workspace2.id });
          await createNote({ name: 'note-2', workspaceId: workspace2.id });
          const n1 = await createNote({ name: 'note-1', workspaceId: workspace.id });
          const n2 = await createNote({ name: 'note-2', workspaceId: workspace.id });
          await createNote({
            name: 'note-3',
            workspaceId: workspace.id,
            archivedAt: new Date(),
          });
          await createNote({
            name: 'note-4',
            workspaceId: workspace.id,
            archivedAt: new Date(),
          });

          const response = await route.request('/api/workspaces/wp-1/notes?archived=false', {
            method: 'GET',
            headers: await headers({ authenticatedUserId: user.id }),
          });

          expect(response.status).toBe(200);
          expect(await response.json()).toMatchObject([{ id: n2.id }, { id: n1.id }]);
        });
      });

      context('when archived is true', () => {
        it('returns archived notes from the workspace', async () => {
          const user = await createUser({ email: 'author@email.com' });
          const workspace = await createWorkspace({ slug: 'wp-1', authorId: user.id });
          const workspace2 = await createWorkspace({ slug: 'wp-2', authorId: user.id });
          await createNote({ name: 'note-1', workspaceId: workspace2.id });
          await createNote({ name: 'note-2', workspaceId: workspace2.id });
          await createNote({ name: 'note-1', workspaceId: workspace.id });
          await createNote({ name: 'note-2', workspaceId: workspace.id });
          const n1 = await createNote({
            name: 'note-3',
            workspaceId: workspace.id,
            archivedAt: new Date(),
          });
          const n2 = await createNote({
            name: 'note-4',
            workspaceId: workspace.id,
            archivedAt: new Date(),
          });

          const response = await route.request('/api/workspaces/wp-1/notes?archived=true', {
            method: 'GET',
            headers: await headers({ authenticatedUserId: user.id }),
          });

          expect(response.status).toBe(200);
          expect(await response.json()).toMatchObject([{ id: n2.id }, { id: n1.id }]);
        });
      });
    });

    context('with filter nameSearch', () => {
      it('returns notes from the workspace matching search term by name', async () => {
        const user = await createUser({ email: 'author@email.com' });
        const workspace = await createWorkspace({ slug: 'wp-1', authorId: user.id });
        const workspace2 = await createWorkspace({ slug: 'wp-2', authorId: user.id });
        await createNote({ name: 'note-1', workspaceId: workspace2.id });
        await createNote({ workspaceId: workspace.id });
        const n1 = await createNote({ name: 'barfooroo', workspaceId: workspace.id });
        const n2 = await createNote({ name: 'bazfooloo', workspaceId: workspace.id });
        await createNote({ workspaceId: workspace.id });

        const response = await route.request('/api/workspaces/wp-1/notes?nameSearch=foo', {
          method: 'GET',
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject([{ id: n2.id }, { id: n1.id }]);
      });
    });

    context('with filter access', () => {
      context('when access is private', () => {
        it('returns private notes from workspace', async () => {
          const user = await createUser({ email: 'author@email.com' });
          const workspace = await createWorkspace({ slug: 'wp-1', authorId: user.id });
          await createNote({ workspaceId: workspace.id, access: 'public' });
          const n1 = await createNote({ workspaceId: workspace.id, access: 'private' });
          const n2 = await createNote({ workspaceId: workspace.id, access: 'private' });
          await createNote({ workspaceId: workspace.id, access: 'public' });

          const response = await route.request('/api/workspaces/wp-1/notes?access=private', {
            method: 'GET',
            headers: await headers({ authenticatedUserId: user.id }),
          });

          expect(response.status).toBe(200);
          expect(await response.json()).toMatchObject([{ id: n2.id }, { id: n1.id }]);
        });
      });

      context('when access is public', () => {
        it('returns private notes from workspace', async () => {
          const user = await createUser({ email: 'author@email.com' });
          const workspace = await createWorkspace({ slug: 'wp-1', authorId: user.id });
          await createNote({ workspaceId: workspace.id, access: 'private' });
          const n1 = await createNote({ workspaceId: workspace.id, access: 'public' });
          const n2 = await createNote({ workspaceId: workspace.id, access: 'public' });
          await createNote({ workspaceId: workspace.id, access: 'private' });

          const response = await route.request('/api/workspaces/wp-1/notes?access=public', {
            method: 'GET',
            headers: await headers({ authenticatedUserId: user.id }),
          });

          expect(response.status).toBe(200);
          expect(await response.json()).toMatchObject([{ id: n2.id }, { id: n1.id }]);
        });
      });

      context('when user doesnt have access to a public workspace', () => {
        it('ignores the access filter and only returns public notes', async () => {
          const user = await createUser({ email: 'author@email.com' });
          const workspace = await createWorkspace({
            slug: 'wp-1',
            authorId: user.id,
            access: 'public',
          });
          const n1 = await createNote({ workspaceId: workspace.id, access: 'public' });
          await createNote({ workspaceId: workspace.id, access: 'private' });
          await createNote({ workspaceId: workspace.id, access: 'private' });
          const n2 = await createNote({ workspaceId: workspace.id, access: 'public' });

          const viewer = await createUser({ email: 'viewer@email.com' });
          const response = await route.request('/api/workspaces/wp-1/notes?access=private', {
            method: 'GET',
            headers: await headers({ authenticatedUserId: viewer.id }),
          });

          expect(response.status).toBe(200);
          expect(await response.json()).toMatchObject([{ id: n2.id }, { id: n1.id }]);
        });
      });
    });

    context('when user doesnt have access to the workspace', () => {
      context('when workspace is public', () => {
        it('returns public notes belonging to the workspace', async () => {
          const user = await createUser({ email: 'author@email.com' });
          const workspace = await createWorkspace({
            slug: 'wp-1',
            authorId: user.id,
            access: 'public',
          });
          const n1 = await createNote({
            name: 'note-1',
            workspaceId: workspace.id,
            access: 'public',
          });
          const n2 = await createNote({
            name: 'note-2',
            workspaceId: workspace.id,
            access: 'public',
          });
          await createNote({
            name: 'note-3',
            workspaceId: workspace.id,
            access: 'private',
          });
          const otherUser = await createUser({ email: 'viewer@email.com' });

          const response = await route.request('/api/workspaces/wp-1/notes', {
            method: 'GET',
            headers: await headers({ authenticatedUserId: otherUser.id }),
          });

          expect(response.status).toBe(200);
          expect(await response.json()).toMatchObject([{ id: n2.id }, { id: n1.id }]);
        });
      });
    });
  });

  response.status('403', () => {
    context('when workspace is private', () => {
      beforeEach(async () => {
        await createWorkspace({ slug: 'wp-1', access: 'private' });
      });

      context('when user does not have access to workspace', () => {
        it('fails with an error message', async () => {
          const user = await createUser({ email: 'author@email.com' });

          const response = await route.request('/api/workspaces/wp-1/notes', {
            method: 'GET',
            headers: await headers({ authenticatedUserId: user.id }),
          });

          expect(response.status).toBe(403);
          expect(await response.json()).toMatchObject({
            error_code: 'cant_access_workspace',
          });
        });
      });

      context('when user is not logged in', () => {
        it('fails with an error message', async () => {
          const response = await route.request('/api/workspaces/wp-1/notes', {
            method: 'GET',
            headers: await headers(),
          });

          expect(response.status).toBe(403);
          expect(await response.json()).toMatchObject({ error_code: 'cant_access_workspace' });
        });
      });
    });
  });

  response.status('404', () => {
    context('when workspace does not exist', () => {
      it('fails with an error message', async () => {
        const user = await createUser();

        const response = await route.request('/api/workspaces/wp-1/notes', {
          method: 'GET',
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(404);
        expect(await response.json()).toMatchObject({ error_code: 'workspace_not_found' });
      });
    });
  });
});
