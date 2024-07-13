import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '../db';
import { Session, User } from '../db/schema';
import { Lucia, Session as LuciaSession, User as LuciaUser, TimeSpan } from 'lucia';
import { hash, verify } from '@node-rs/argon2';
import { createMiddleware } from 'hono/factory';

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

export const privateRoute = createMiddleware(async (ctx, next) => {
  const authorizationHeader = ctx.req.header('Authorization');
  const sessionId = lucia.readBearerToken(authorizationHeader ?? '');
  if (!sessionId) return ctx.json({ error: 'Unauthenticated request' }, 401);

  const { session, user } = await lucia.validateSession(sessionId);
  if (!user || !session) return ctx.json({ error: 'Unauthenticated request' }, 401);

  ctx.set('user', user);
  ctx.set('session', session);

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
