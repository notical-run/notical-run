import { pgTable, foreignKey, unique, pgEnum, uuid, text, timestamp, uniqueIndex, date } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const accessType = pgEnum("accessType", ['public', 'private'])


export const workspaces = pgTable("workspaces", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: text("name").notNull(),
	slug: text("slug").notNull(),
	author_id: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	deleted_at: timestamp("deleted_at", { mode: 'string' }),
	created_at: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updated_at: timestamp("updated_at", { mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		workspaces_slug_unique: unique("workspaces_slug_unique").on(table.slug),
	}
});

export const notes = pgTable("notes", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: text("name").notNull(),
	content: text("content"),
	workspace_id: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" } ),
	author_id: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	deleted_at: date("deleted_at"),
	access: accessType("access").notNull(),
	created_at: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updated_at: timestamp("updated_at", { mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		workspace_id_name_idx: uniqueIndex().using("btree", table.workspace_id, table.name),
	}
});

export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: text("name").notNull(),
	email: text("email").notNull(),
	password: text("password").notNull(),
	created_at: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updated_at: timestamp("updated_at", { mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		users_email_unique: unique("users_email_unique").on(table.email),
	}
});

export const session = pgTable("session", {
	id: text("id").primaryKey().notNull(),
	user_id: uuid("user_id").notNull().references(() => users.id),
	expires_at: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
});