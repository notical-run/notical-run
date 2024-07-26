import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { Lucia, Session as LuciaSession, User as LuciaUser, TimeSpan } from 'lucia';
import { hash, verify } from '@node-rs/argon2/index.js';
import { createMiddleware } from 'hono/factory';
import { db } from '../db';
import { Session, User } from '../db/schema';

export const authAdapter = new DrizzlePostgreSQLAdapter(db, Session, User);

export const lucia = new Lucia(authAdapter, {
  sessionExpiresIn: new TimeSpan(2, 'w'),
  sessionCookie: {
    attributes: {
      secure: import.meta.env.NODE_ENV === 'production',
    },
  },
});

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
  }
}

export type SessionVars = {
  user: LuciaUser | null;
  session: LuciaSession | null;
};

export const authenticationMiddleware = createMiddleware(async (ctx, next) => {
  const authorizationHeader = ctx.req.header('Authorization');
  const sessionId = lucia.readBearerToken(authorizationHeader ?? '');

  if (sessionId) {
    const { session, user } = await lucia.validateSession(sessionId);
    user && ctx.set('user', user);
    session && ctx.set('session', session);
  }

  return next();
});

export const privateRoute = createMiddleware(async (ctx, next) => {
  const authorizationHeader = ctx.req.header('Authorization');
  const sessionId = lucia.readBearerToken(authorizationHeader ?? '');

  if (!sessionId)
    return ctx.json({ error: 'Unauthenticated request', error_code: 'unauthenticated' }, 401);

  if (!ctx.get('session') || !ctx.get('user'))
    return ctx.json({ error: 'Unauthenticated request', error_code: 'unauthenticated' }, 401);

  return next();
});

export const hashPassword = (pass: string) =>
  hash(pass, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

export const verifyPassword = (hash: string, pass: string) =>
  verify(hash, pass, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
