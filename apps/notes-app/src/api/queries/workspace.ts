import { createMutation, createQuery, useQueryClient } from '@tanstack/solid-query';
import { apiClient, responseJson } from '../../utils/api-client';
import { queryKeys } from '../keys';
import { Accessor } from 'solid-js';
import { useSessionId } from '@/components/Auth/Session';
import { QueryResponseType } from '@/utils/solid-helpers';

export type WorkspaceQueryResult = QueryResponseType<ReturnType<typeof useWorkspace>>;

export const useWorkspace = (workspaceSlug: Accessor<string>) => {
  return createQuery(() => ({
    queryKey: queryKeys.workspace(workspaceSlug()),
    queryFn: async () =>
      apiClient.api.workspaces[':workspaceSlug']
        .$get({ param: { workspaceSlug: workspaceSlug() } })
        .then(responseJson),
  }));
};

export type WorkspacesQueryResult = QueryResponseType<ReturnType<typeof useUserWorkspaces>>;

export const useUserWorkspaces = () => {
  const [sessionId] = useSessionId();

  return createQuery(() => ({
    queryKey: queryKeys.workspaces(),
    queryFn: async () => apiClient.api.workspaces.$get().then(responseJson),
    enabled: Boolean(sessionId()),
  }));
};

export type WorkspaceNotesQueryResult = QueryResponseType<ReturnType<typeof useWorkspaceNotes>>;

export const useWorkspaceNotes = (
  workspaceSlug: Accessor<string>,
  params?: { archived?: boolean },
) => {
  return createQuery(() => ({
    queryKey: queryKeys.workspaceNotes(workspaceSlug()),
    queryFn: async () =>
      apiClient.api.workspaces[':workspaceSlug'].notes
        .$get({
          param: { workspaceSlug: workspaceSlug() },
          query: { archived: `${params?.archived ?? false}` },
        })
        .then(responseJson),
    enabled: Boolean(workspaceSlug()),
  }));
};

export const fetchNote = (workspaceSlug: string, noteId: string) =>
  apiClient.api.workspaces[':workspaceSlug'].notes[':noteId']
    .$get({ param: { workspaceSlug: workspaceSlug, noteId: noteId } })
    .then(responseJson);

export type NoteQueryResult = QueryResponseType<ReturnType<typeof useNote>>;

export const useNote = (workspaceSlug: Accessor<string>, noteId: Accessor<string>) => {
  return createQuery(() => ({
    queryKey: queryKeys.note(workspaceSlug(), noteId()),
    queryFn: async () => fetchNote(workspaceSlug(), noteId()),
    enabled: Boolean(workspaceSlug() && noteId()),
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
    enabled: Boolean(workspaceSlug()),
  }));
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (body: { name: string; slug: string; private: boolean }) =>
      apiClient.api.workspaces
        .$post({ json: { ...body, access: body.private ? 'private' : 'public' } })
        .then(responseJson),
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces(),
      });
    },
  }));
};

export const useUpdateNote = (
  workspaceSlug: string,
  noteId: string,
  { invalidateCache }: { invalidateCache?: boolean } = {},
) => {
  const queryClient = useQueryClient();
  const param = { workspaceSlug, noteId };

  return createMutation(() => ({
    mutationFn: async (body: { content?: string; access?: NoteQueryResult['access'] }) =>
      apiClient.api.workspaces[':workspaceSlug'].notes[':noteId']
        .$patch({ param, json: body })
        .then(responseJson),
    enabled: Boolean(workspaceSlug && noteId),
    onSuccess() {
      if (invalidateCache) {
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaceNotes(workspaceSlug) });
        queryClient.invalidateQueries({ queryKey: queryKeys.note(workspaceSlug, noteId) });
      }
    },
  }));
};

export const useArchiveNote = (workspaceSlug: string, noteId: string) => {
  const queryClient = useQueryClient();
  const param = { workspaceSlug, noteId };

  return createMutation(() => ({
    mutationFn: async () =>
      apiClient.api.workspaces[':workspaceSlug'].notes[':noteId'].archive
        .$post({ param })
        .then(responseJson),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceNotes(workspaceSlug) });
      queryClient.invalidateQueries({ queryKey: queryKeys.note(workspaceSlug, noteId) });
    },
    enabled: Boolean(workspaceSlug && noteId),
  }));
};

export const useUnarchiveNote = (workspaceSlug: string, noteId: string) => {
  const queryClient = useQueryClient();
  const param = { workspaceSlug, noteId };

  return createMutation(() => ({
    mutationFn: async () =>
      apiClient.api.workspaces[':workspaceSlug'].notes[':noteId'].unarchive
        .$post({ param })
        .then(responseJson),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceNotes(workspaceSlug) });
      queryClient.invalidateQueries({ queryKey: queryKeys.note(workspaceSlug, noteId) });
    },
    enabled: Boolean(workspaceSlug && noteId),
  }));
};
