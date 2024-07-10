import { Hono } from 'hono';
import { privateRoute, SessionVars } from '../../auth';
import { db } from '../../db';
import { eq } from 'drizzle-orm';
import { User } from '../../db/schema';

export const userRoute = new Hono<{ Variables: SessionVars }>()
  .use(privateRoute)
  .get('me', async c => {
    const currentUser = c.get('user')!;
    const user = db.query.User.findFirst({
      where: eq(User.id, currentUser.id),
      columns: {
        id: true,
        name: true,
        email: true,
      },
    });
    c.json(user, 200);
  });
