export const queryKeys = {
  me: () => ['me'],
  workspaces: () => ['workspaces'],
  note: (workspaceSlug: string, noteId: string) => ['workspaces', workspaceSlug, 'notes', noteId],
  workspaceNotes: (workspaceSlug: string) => ['workspaces', workspaceSlug, 'notes'],
};
