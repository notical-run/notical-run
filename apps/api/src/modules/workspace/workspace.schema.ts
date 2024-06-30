import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { users } from '../user/user.schema';
import { timestampColumns } from '../../utils/db';

export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  slug: text('slug'),
  authorId: uuid('author_id').references(() => users.id),
  ...timestampColumns(),
});
