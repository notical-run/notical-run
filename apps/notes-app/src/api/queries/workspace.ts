import { createMutation, createQuery, useQueryClient } from '@tanstack/solid-query';
import { apiClient, responseJson } from '../../utils/api-client';
import { queryKeys } from '../keys';
import { Accessor } from 'solid-js';

export const useWorkspaces = () => {
  return createQuery(() => ({
    queryKey: queryKeys.workspaces(),
    queryFn: async () => apiClient.api.workspaces.$get().then(responseJson),
  }));
};

export const useWorkspaceNotes = (workspaceSlug: Accessor<string>) => {
  return createQuery(() => ({
    queryKey: queryKeys.workspaceNotes(workspaceSlug()),
    queryFn: async () =>
      apiClient.api.workspaces[':workspaceSlug'].notes
        .$get({ param: { workspaceSlug: workspaceSlug() } })
        .then(responseJson),
  }));
};

export const fetchNote = (workspaceSlug: string, noteId: string) =>
  apiClient.api.workspaces[':workspaceSlug'].notes[':noteId']
    .$get({ param: { workspaceSlug: workspaceSlug, noteId: noteId } })
    .then(responseJson);

export const useNote = (workspaceSlug: Accessor<string>, noteId: Accessor<string>) => {
  return createQuery(() => ({
    queryKey: queryKeys.note(workspaceSlug(), noteId()),
    queryFn: async () => fetchNote(workspaceSlug(), noteId()),
    suspense: true,
  }));
};

export const useCreateNote = (workspaceSlug: Accessor<string>) => {
  const queryClient = useQueryClient();

  const params = { workspaceSlug: workspaceSlug() };
  return createMutation(() => ({
    mutationFn: async (body: { name: string }) =>
      apiClient.api.workspaces[':workspaceSlug'].notes
        .$post({ param: params, json: body })
        .then(responseJson),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaceNotes(workspaceSlug()),
      });
    },
  }));
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (body: { name: string; slug: string }) =>
      apiClient.api.workspaces.$post({ json: body }).then(responseJson),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces(),
      });
    },
  }));
};

export const useUpdateNote = (workspaceSlug: string, noteId: string) => {
  const params = { workspaceSlug, noteId };
  return createMutation(() => ({
    mutationFn: async (body: { name?: string; content?: string }) =>
      apiClient.api.workspaces[':workspaceSlug'].notes[':noteId']
        .$patch({ param: params, json: body })
        .then(responseJson),
    enabled: !!workspaceSlug && !!noteId,
  }));
};
