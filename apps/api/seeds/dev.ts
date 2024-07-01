import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { Note, User, Workspace } from '../src/db/schema';

if (!import.meta.env.POSTGRES_CONNECTION_STRING) {
  throw new Error('Missing POSTGRES_CONNECTION_STRING');
}

export const queryClient = postgres(import.meta.env.POSTGRES_CONNECTION_STRING);
export const db = drizzle(queryClient);

const clarice = await db
  .insert(User)
  .values({
    name: 'Clarice Starling',
    email: 'clarice@email.com',
  })
  .returning();

await db.insert(User).values({
  name: 'Hannibal Lecter',
  email: 'hannibal@email.com',
});

const workspace = await db
  .insert(Workspace)
  .values({
    name: 'Clarice Workspace',
    slug: 'clarice',
    authorId: clarice[0].id,
  })
  .returning();

await db.insert(Note).values({
  name: 'Note 1',
  workspaceId: workspace[0].id,
  authorId: clarice[0].id,
});

await db.insert(Note).values({
  name: 'Note 2',
  workspaceId: workspace[0].id,
  authorId: clarice[0].id,
});

await queryClient.end();
