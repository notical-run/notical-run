import { Hono } from 'hono';
import { hashPassword, lucia, SessionVars, verifyPassword } from '../../auth';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from '../../db';
import { User } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(20),
});

export const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).max(20),
});

export const authRoute = new Hono<{ Variables: SessionVars }>()
  .post('login', zValidator('json', loginSchema), async c => {
    const userJson = c.req.valid('json');
    const user = await db.query.User.findFirst({
      where: eq(User.email, userJson.email),
      columns: { id: true, password: true },
    });
    if (!user) {
      return c.json({ error: 'Invalid email/password' }, 401);
    }
    const isValidPass = verifyPassword(user.password, userJson.password);
    if (!isValidPass) return c.json({ error: 'Invalid email/password' }, 401);

    const session = await lucia.createSession(user.id, {});
    return c.json({ userId: user.id, sessionId: session.id });
  })
  .post('signup', zValidator('json', signupSchema), async c => {
    const userJson = c.req.valid('json');
    const resultUsers = await db
      .insert(User)
      .values({
        name: userJson.name,
        email: userJson.email,
        password: await hashPassword(userJson.password),
      })
      .returning({ id: User.id });

    const user = resultUsers[0];
    const session = await lucia.createSession(user.id, {});

    c.set('session', session);
    c.set('user', user);

    return c.json({ userId: user.id, sessionId: session.id }, 201);
  })
  .post('logout', async c => {
    const session = c.get('session');
    if (!session) return c.json({ success: true });

    await lucia.invalidateSession(session.id);
    c.set('user', null);
    c.set('session', null);

    return c.json({ success: true });
  });
