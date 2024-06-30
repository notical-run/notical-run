import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { users } from './user.schema';

export const findUserById = async (id: string) => {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  if (result.length !== 1) {
    throw new Error('User not found');
  }

  return result[0];
};
