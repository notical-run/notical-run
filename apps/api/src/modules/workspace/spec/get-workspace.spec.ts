import { request, context, response, headers } from '../../../utils/test';
import { createUser } from '../../../factory/user';
import route from '../../../index';
import { createWorkspace } from '../../../factory/workspace';

request('GET /workspaces/:workspaceSlug', () => {
  response.status('200', () => {
    context('when user has access to view the workspace', () => {
      it('returns workspace', async () => {
        const user = await createUser({ email: 'author@email.com' });
        await createWorkspace({ slug: 'wp-2', authorId: user.id });
        const wp1 = await createWorkspace({ slug: 'wp-1', authorId: user.id });

        const response = await route.request('/api/workspaces/wp-1', {
          method: 'GET',
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({ id: wp1.id });
      });
    });
  });

  response.status('403', () => {
    context('when user doesnt have access to view the workspace', () => {
      it('fails with an error message', async () => {
        const user = await createUser({ email: 'author@email.com' });
        await createWorkspace({ slug: 'wp-1' });

        const response = await route.request('/api/workspaces/wp-1', {
          method: 'GET',
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(403);
        expect(await response.json()).toMatchObject({ error_code: 'cant_access_workspace' });
      });
    });
  });

  response.status('404', () => {
    context('when workspace doesnt exist', () => {
      it('fails with an error message', async () => {
        const user = await createUser({ email: 'author@email.com' });

        const response = await route.request('/api/workspaces/wp-1', {
          method: 'GET',
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(404);
        expect(await response.json()).toMatchObject({ error_code: 'workspace_not_found' });
      });
    });
  });

  response.status('401', () => {
    context('when user is not authenticated', () => {
      it('fails with an error message', async () => {
        const response = await route.request('/api/workspaces/wp-1', { method: 'GET' });

        expect(response.status).toBe(401);
        expect(await response.json()).toMatchObject({ error_code: 'unauthenticated' });
      });
    });
  });
});
