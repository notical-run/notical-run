import {
  createMutation,
  createQuery,
  useQueryClient,
} from '@tanstack/solid-query';
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

export const useCreateNote = (workspaceSlug: string) => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (params: { name: string }) =>
      apiClient.api.workspaces[':workspaceSlug'].notes
        .$post({ param: { workspaceSlug }, json: params })
        .then(responseJson),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaceNotes(workspaceSlug),
      });
    },
  }));
};

export const useUpdateNote = (workspaceSlug: string, noteId: string) => {
  return createMutation(() => ({
    mutationFn: async (params: { name?: string; content?: string }) =>
      apiClient.api.workspaces[':workspaceSlug'].notes[':noteId']
        .$patch({ param: { workspaceSlug, noteId }, json: params })
        .then(responseJson),
  }));
};
