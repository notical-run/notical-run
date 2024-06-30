import { db, queryClient } from '../src/db';
import { users, workspaces } from '../src/db/schema';

const clarice = await db
  .insert(users)
  .values({
    name: 'Clarice Starling',
    email: 'clarice@email.com',
  })
  .returning();

await db.insert(users).values({
  name: 'Hannibal Lecter',
  email: 'hannibal@email.com',
});

await db.insert(workspaces).values({
  name: 'Clarice Workspace',
  slug: 'clarice',
  authorId: clarice[0].id,
});

await queryClient.end();
