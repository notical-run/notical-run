import { request, context, response } from '../../../utils/test';
import { createSession, createUser } from '../../../factory/user';
import route from '../../../index';
import { createWorkspace } from '../../../factory/workspace';

request('GET /workspaces', () => {
  response.status('200', () => {
    context('when user has workspaces', () => {
      it('returns workspaces belonging to the user', async () => {
        const user = await createUser({ email: 'author@email.com' });
        const wp1 = await createWorkspace({ slug: 'wp-1', authorId: user.id });
        const wp2 = await createWorkspace({ slug: 'wp-2', authorId: user.id });
        const wp3 = await createWorkspace({ slug: 'wp-3', authorId: user.id });
        await createWorkspace({ slug: 'someone elses workspace' });

        const session = await createSession(user.id);
        const response = await route.request('/api/workspaces', {
          method: 'GET',
          headers: { Authorization: `Bearer ${session.id}` },
        });

        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject([
          { id: wp3.id },
          { id: wp2.id },
          { id: wp1.id },
        ]);
      });
    });

    context('when user does not have any workspaces', () => {
      it('returns workspaces belonging to the user', async () => {
        const user = await createUser({ email: 'author@email.com' });
        await createWorkspace({ slug: 'someone elses workspace' });
        await createWorkspace({ slug: 'someone elses workspace2' });

        const session = await createSession(user.id);
        const response = await route.request('/api/workspaces', {
          method: 'GET',
          headers: { Authorization: `Bearer ${session.id}` },
        });

        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject([]);
      });
    });
  });

  response.status('401', () => {
    context('when user is not authenticated', () => {
      it('fails with an error message', async () => {
        const response = await route.request('/api/workspaces', { method: 'GET' });

        expect(response.status).toBe(401);
        expect(await response.json()).toMatchObject({ error: 'Unauthenticated request' });
      });
    });
  });
});
