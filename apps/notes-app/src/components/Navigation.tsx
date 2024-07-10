export const links = {
  workspaces: () => '/workspaces',
  workspaceNotes: (slug: string) => `/workspaces/${slug}/notes`,
  workspaceNote: (slug: string, noteId: string) =>
    `/workspaces/${slug}/notes/${noteId}`,
  login: () => '/login',
  register: () => '/register',
};
