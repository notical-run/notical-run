import { request, context, response, headers } from '../../../utils/test';
import { createUser } from '../../../factory/user';
import route from '../../../index';
import { createWorkspace } from '../../../factory/workspace';

request('POST /workspaces', () => {
  response.status('201', () => {
    context('when the params are valid', () => {
      it('creates a new workspace', async () => {
        const user = await createUser({ email: 'author@email.com' });

        const response = await route.request('/api/workspaces', {
          method: 'POST',
          body: JSON.stringify({ name: 'My workspace', slug: 'my-workspace' }),
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(201);
        expect(await response.json()).toMatchObject({
          id: expect.any(String),
          name: 'My workspace',
          slug: 'my-workspace',
        });
      });
    });
  });

  response.status('400', () => {
    context('when the name is not passed or empty', () => {
      it('fails with an error', async () => {
        const user = await createUser({ email: 'author@email.com' });

        const response = await route.request('/api/workspaces', {
          method: 'POST',
          body: JSON.stringify({ name: '', slug: '1234' }),
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(400);
      });
    });

    context('when the slug is not passed or empty', () => {
      it('fails with an error', async () => {
        const user = await createUser({ email: 'author@email.com' });

        const response = await route.request('/api/workspaces', {
          method: 'POST',
          body: JSON.stringify({ name: 'Name', slug: '' }),
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(400);
      });
    });

    context('when the slug contains invalid characters', () => {
      const slugs = ['hello world', 'he$$o', 'foo*1', 'p@lo'];
      it.each(slugs)('fails with an error for "%s"', async slug => {
        const user = await createUser({ email: 'author@email.com' });

        const response = await route.request('/api/workspaces', {
          method: 'POST',
          body: JSON.stringify({ name: 'Workspace', slug }),
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(400);
      });
    });
  });

  response.status('422', () => {
    context('when a workspace with the same slug already exists in the workspace', () => {
      it('fails with an error message', async () => {
        const user = await createUser({ email: 'author@email.com' });
        await createWorkspace({ slug: 'wp-1', authorId: user.id });

        const response = await route.request('/api/workspaces', {
          method: 'POST',
          body: JSON.stringify({ name: 'Workspace', slug: 'wp-1' }),
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(422);
        expect(await response.json()).toMatchObject({ error: 'Workspace already exists' });
      });
    });
  });

  response.status('401', () => {
    context('when user is not logged in', () => {
      it('fails with an error message', async () => {
        await createWorkspace({ slug: 'wp-1' });

        const response = await route.request('/api/workspaces', {
          method: 'POST',
          headers: await headers(),
        });

        expect(response.status).toBe(401);
        expect(await response.json()).toMatchObject({ error: 'Unauthenticated request' });
      });
    });
  });
});
