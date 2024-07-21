import { createMutation, createQuery, useQueryClient } from '@tanstack/solid-query';
import { apiClient, responseJson } from '../../utils/api-client';
import { queryKeys } from '../keys';
import { Accessor } from 'solid-js';
import { useSessionId } from '@/components/Auth/Session';

export const useWorkspaces = () => {
  const [sessionId] = useSessionId();

  return createQuery(() => ({
    queryKey: queryKeys.workspaces(),
    queryFn: async () => apiClient.api.workspaces.$get().then(responseJson),
    initialData: [],
    enabled: !!sessionId(),
  }));
};

export const useWorkspaceNotes = (workspaceSlug: Accessor<string>) => {
  const [sessionId] = useSessionId();

  return createQuery(() => ({
    queryKey: queryKeys.workspaceNotes(workspaceSlug()),
    queryFn: async () =>
      apiClient.api.workspaces[':workspaceSlug'].notes
        .$get({ param: { workspaceSlug: workspaceSlug() }, query: { archived: `${false}` } })
        .then(responseJson),
    initialData: [],
    enabled: !!sessionId() && !!workspaceSlug(),
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
  const param = { workspaceSlug, noteId };
  return createMutation(() => ({
    mutationFn: async (body: { name?: string; content?: string }) =>
      apiClient.api.workspaces[':workspaceSlug'].notes[':noteId']
        .$patch({ param, json: body })
        .then(responseJson),
    enabled: !!workspaceSlug && !!noteId,
  }));
};

export const useArchiveNote = (workspaceSlug: string, noteId: string) => {
  const queryClient = useQueryClient();
  const param = { workspaceSlug, noteId };

  return createMutation(() => ({
    mutationFn: async () =>
      apiClient.api.workspaces[':workspaceSlug'].notes[':noteId']
        .$delete({ param })
        .then(responseJson),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceNotes(workspaceSlug) });
      queryClient.invalidateQueries({ queryKey: queryKeys.note(workspaceSlug, noteId) });
    },
    enabled: !!workspaceSlug && !!noteId,
  }));
};
