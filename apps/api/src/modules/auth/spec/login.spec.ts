import { request, context, response } from '../../../utils/test';
import { createUser } from '../../../factory/user';
import route from '../../../index';

request('POST /auth/login', () => {
  response.status('200', () => {
    context('when credentials are correct', () => {
      it('returns with a new session id', async () => {
        const user = await createUser({ email: 'user@email.com', password: '123123123' });

        const response = await route.request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: 'user@email.com', password: '123123123' }),
          headers: { 'Content-Type': 'application/json' },
        });

        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({
          userId: user.id,
          sessionId: expect.any(String),
        });
      });
    });
  });

  response.status('403', () => {
    context('when the email is wrong', () => {
      it('fails with an error', async () => {
        await createUser({ email: 'user@email.com', password: '123123123' });

        const response = await route.request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: 'wronguser@email.com', password: '123123123' }),
          headers: { 'Content-Type': 'application/json' },
        });

        expect(response.status).toBe(403);
        expect(await response.json()).toEqual({
          error: 'Invalid email/password',
        });
      });
    });

    context('when the password is wrong', () => {
      it('fails with an error', async () => {
        await createUser({ email: 'user@email.com', password: '123123123' });

        const response = await route.request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: 'user@email.com', password: 'wrong password' }),
          headers: { 'Content-Type': 'application/json' },
        });

        expect(response.status).toBe(403);
        expect(await response.json()).toEqual({
          error: 'Invalid email/password',
        });
      });
    });
  });

  response.status('400', () => {
    context('when the email is invalid', () => {
      it('fails with an error', async () => {
        const response = await route.request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: 'invalid email', password: '123123123' }),
          headers: { 'Content-Type': 'application/json' },
        });

        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({
          error: {
            issues: [{ code: 'invalid_string', path: ['email'] }],
          },
        });
      });
    });

    context('when the password is too short', () => {
      it('fails with an error', async () => {
        const response = await route.request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: 'user@email.com', password: '123' }),
          headers: { 'Content-Type': 'application/json' },
        });

        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({
          error: {
            issues: [{ code: 'too_small', minimum: 8, path: ['password'] }],
          },
        });
      });
    });
  });
});
