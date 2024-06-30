import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { timestampColumns } from '../../utils/db';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  name: text('name'),
  email: text('email'),
  ...timestampColumns(),
});
