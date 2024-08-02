import { request, context, response, headers } from '../../../utils/test';
import { createUser } from '../../../factory/user';
import route from '../../../index';
import { createWorkspace } from '../../../factory/workspace';
import { db } from '../../../db';
import { eq } from 'drizzle-orm';
import { Workspace } from '../../../db/schema';

request('PATCH /workspaces/:workspaceSlug', () => {
  response.status('200', () => {
    context('when passed a new workspace name', () => {
      it('updates workspace name', async () => {
        const user = await createUser({ email: 'author@email.com' });
        const workspace = await createWorkspace({
          slug: 'wp-1',
          name: 'Old name',
          authorId: user.id,
        });

        const response = await route.request('/api/workspaces/wp-1', {
          method: 'PATCH',
          body: JSON.stringify({ name: 'New workspace' }),
          headers: await headers({ authenticatedUserId: user.id }),
        });

        const updatedWorkspace = await db.query.Workspace.findFirst({
          where: eq(Workspace.id, workspace.id),
        });
        expect(response.status).toBe(200);
        expect(updatedWorkspace).toMatchObject({ name: 'New workspace' });
      });
    });

    context('with access: private', () => {
      it('makes the workspace private', async () => {
        const user = await createUser({ email: 'author@email.com' });
        const workspace = await createWorkspace({
          slug: 'wp-1',
          name: 'Old name',
          authorId: user.id,
          access: 'public',
        });

        const response = await route.request('/api/workspaces/wp-1', {
          method: 'PATCH',
          body: JSON.stringify({ access: 'private' }),
          headers: await headers({ authenticatedUserId: user.id }),
        });

        const updatedWorkspace = await db.query.Workspace.findFirst({
          where: eq(Workspace.id, workspace.id),
        });
        expect(response.status).toBe(200);
        expect(updatedWorkspace).toMatchObject({ access: 'private' });
      });
    });

    context('with access: public', () => {
      it('makes the workspace public', async () => {
        const user = await createUser({ email: 'author@email.com' });
        const workspace = await createWorkspace({
          slug: 'wp-1',
          name: 'Old name',
          authorId: user.id,
          access: 'private',
        });

        const response = await route.request('/api/workspaces/wp-1', {
          method: 'PATCH',
          body: JSON.stringify({ access: 'public' }),
          headers: await headers({ authenticatedUserId: user.id }),
        });

        const updatedWorkspace = await db.query.Workspace.findFirst({
          where: eq(Workspace.id, workspace.id),
        });
        expect(response.status).toBe(200);
        expect(updatedWorkspace).toMatchObject({ access: 'public' });
      });
    });
  });

  response.status('400', () => {
    context('when the access passed is invalid', () => {
      it('fails with an error', async () => {
        const user = await createUser({ email: 'author@email.com' });
        await createWorkspace({ slug: 'wp-1', authorId: user.id });

        const response = await route.request('/api/workspaces/wp-1', {
          method: 'PATCH',
          body: JSON.stringify({ access: 'foobar' }),
          headers: await headers({ authenticatedUserId: user.id }),
        });

        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({ error: { name: 'ZodError' } });
      });
    });
  });

  response.status('401', () => {
    context('when user is not logged in', () => {
      it('fails with an error message', async () => {
        await createWorkspace({ slug: 'wp-1' });

        const response = await route.request('/api/workspaces/wp-1', {
          method: 'PATCH',
          headers: await headers(),
        });

        expect(response.status).toBe(401);
        expect(await response.json()).toMatchObject({ error_code: 'unauthenticated' });
      });
    });
  });
});
