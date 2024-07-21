import { relations } from "drizzle-orm/relations";
import { users, workspaces, notes, session } from "./schema";

export const workspacesRelations = relations(workspaces, ({one, many}) => ({
	user: one(users, {
		fields: [workspaces.author_id],
		references: [users.id]
	}),
	notes: many(notes),
}));

export const usersRelations = relations(users, ({many}) => ({
	workspaces: many(workspaces),
	notes: many(notes),
	sessions: many(session),
}));

export const notesRelations = relations(notes, ({one}) => ({
	workspace: one(workspaces, {
		fields: [notes.workspace_id],
		references: [workspaces.id]
	}),
	user: one(users, {
		fields: [notes.author_id],
		references: [users.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(users, {
		fields: [session.user_id],
		references: [users.id]
	}),
}));