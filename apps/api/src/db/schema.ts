import { pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { timestampColumns } from '../utils/db';
import { relations } from 'drizzle-orm';

// Note access types
export const AccessType = pgEnum('access_type', ['public', 'private']);

// Users
export const User = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  ...timestampColumns(),
});
export const userRelations = relations(User, ({ many }) => ({
  workspaces: many(Workspace),
  sessions: many(Session),
}));

export type UserType = typeof User.$inferInsert;

export const Session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => User.id),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
});
export const sessionRelations = relations(Session, ({ one }) => ({
  user: one(User),
}));

// Workspaces
export const Workspace = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  authorId: uuid('author_id')
    .notNull()
    .references(() => User.id, { onDelete: 'cascade' }),
  deletedAt: timestamp('deleted_at'),
  ...timestampColumns(),
});
export const workspaceRelations = relations(Workspace, ({ one, many }) => ({
  author: one(User, { fields: [Workspace.authorId], references: [User.id] }),
  notes: many(Note),
}));
export type WorkspaceType = typeof Workspace.$inferInsert;

// Notes
export const Note = pgTable(
  'notes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    content: text('content'),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => Workspace.id, { onDelete: 'cascade' }),
    authorId: uuid('author_id')
      .notNull()
      .references(() => User.id, { onDelete: 'cascade' }),
    archivedAt: timestamp('archived_at'),
    access: AccessType('access')
      .notNull()
      .$default(() => 'public'),
    ...timestampColumns(),
  },
  t => ({
    uniqueWorkspaceNote: uniqueIndex().on(t.workspaceId, t.name),
  }),
);
export const noteRelations = relations(Note, ({ one }) => ({
  author: one(User, { fields: [Note.authorId], references: [User.id] }),
  workspace: one(Workspace, {
    fields: [Note.workspaceId],
    references: [Workspace.id],
  }),
}));
export type NoteType = typeof Note.$inferInsert;
