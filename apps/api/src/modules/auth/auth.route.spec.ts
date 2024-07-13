import { request, context, response } from '../../utils/test';
import { db } from '../../db';
import { User } from '../../db/schema';
import { userFactory } from '../../factory/user';
import route from '../..';

request('POST /auth/login', () => {
  response.status('200', () => {
    context('when credentials are correct', () => {
      it('returns a 200 response with the new session id', async () => {
        const createdUser = await db
          .insert(User)
          .values(await userFactory({ email: 'user@email.com', password: '123123123' }))
          .returning({ id: User.id });

        const response = await route.request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: 'user@email.com', password: '123123123' }),
          headers: { 'Content-Type': 'application/json' },
        });

        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({
          userId: createdUser[0].id,
          sessionId: expect.any(String),
        });
      });
    });
  });

  response.status('401', () => {
    context('when the email is wrong', () => {
      it('returns a 401 response with an error', async () => {
        await db
          .insert(User)
          .values(await userFactory({ email: 'user@email.com', password: '123123123' }));

        const response = await route.request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: 'wronguser@email.com', password: '123123123' }),
          headers: { 'Content-Type': 'application/json' },
        });

        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({
          error: 'Invalid email/password',
        });
      });
    });

    context('when the password is wrong', () => {
      it('returns a 401 response with an error', async () => {
        await db
          .insert(User)
          .values(await userFactory({ email: 'user@email.com', password: '123123123' }));

        const response = await route.request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: 'user@email.com', password: 'wrong password' }),
          headers: { 'Content-Type': 'application/json' },
        });

        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({
          error: 'Invalid email/password',
        });
      });
    });
  });

  response.status('400', () => {
    context('when the email is invalid', () => {
      it('returns a 401 response with an error', async () => {
        const response = await route.request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: 'invalid email', password: '123123123' }),
          headers: { 'Content-Type': 'application/json' },
        });

        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({
          error: {
            issues: [
              {
                code: 'invalid_string',
                message: 'Invalid email',
                path: ['email'],
                validation: 'email',
              },
            ],
          },
        });
      });
    });

    context('when the password is too short', () => {
      it('returns a 401 response with an error', async () => {
        const response = await route.request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: 'user@email.com', password: '123' }),
          headers: { 'Content-Type': 'application/json' },
        });

        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({
          error: {
            issues: [
              {
                code: 'too_small',
                message: 'String must contain at least 8 character(s)',
                minimum: 8,
                path: ['password'],
              },
            ],
          },
        });
      });
    });
  });
});
