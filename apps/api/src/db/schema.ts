import { date, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { timestampColumns } from '../utils/db';
import { relations } from 'drizzle-orm';

// Users
export const User = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  email: text('email'),
  ...timestampColumns(),
});
export const userRelations = relations(User, ({ many }) => ({
  workspaces: many(Workspace),
}));

// Workspaces
export const Workspace = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  authorId: uuid('author_id')
    .notNull()
    .references(() => User.id, { onDelete: 'cascade' }),
  deletedAt: date('deleted_at'),
  ...timestampColumns(),
});
export const workspaceRelations = relations(Workspace, ({ one, many }) => ({
  author: one(User, { fields: [Workspace.authorId], references: [User.id] }),
  notes: many(Note),
}));

// Notes
export const Note = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  content: text('content'),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => Workspace.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id')
    .notNull()
    .references(() => User.id, { onDelete: 'cascade' }),
  deletedAt: date('deleted_at'),
  ...timestampColumns(),
});
export const noteRelations = relations(Note, ({ one }) => ({
  workspace: one(Workspace, {
    fields: [Note.workspaceId],
    references: [Workspace.id],
  }),
}));
