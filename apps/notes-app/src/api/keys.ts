export const queryKeys = {
  me: () => ['me'],
  workspaces: () => ['workspaces'],
  workspace: (workspaceSlug: string) => ['workspaces', workspaceSlug],
  note: (workspaceSlug: string, noteId: string) => ['workspaces', workspaceSlug, 'notes', noteId],
  workspaceNotes: (workspaceSlug: string) => ['workspaces', workspaceSlug, 'notes'],
};
