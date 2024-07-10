import { createQuery } from '@tanstack/solid-query';
import { apiClient, responseJson } from '../../utils/api-client';
import { queryKeys } from '../keys';

export const useWorkspaces = () => {
  return createQuery(() => ({
    queryKey: queryKeys.workspaces(),
    queryFn: async () => apiClient.api.workspaces.$get().then(responseJson),
  }));
};

export const useWorkspaceNotes = (workspaceSlug: string) => {
  return createQuery(() => ({
    queryKey: queryKeys.workspaceNotes(workspaceSlug),
    queryFn: async () =>
      apiClient.api.workspaces[':workspaceSlug'].notes
        .$get({ param: { workspaceSlug } })
        .then(responseJson),
  }));
};

export const useNote = (workspaceSlug: string, noteId: string) => {
  return createQuery(() => ({
    queryKey: queryKeys.note(workspaceSlug, noteId),
    queryFn: async () =>
      apiClient.api.workspaces[':workspaceSlug'].notes[':noteId']
        .$get({ param: { workspaceSlug, noteId } })
        .then(responseJson),
  }));
};
