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

type Filters = { archived?: boolean; nameSearch?: string };

export const fetchWorkspaceNotes = (workspaceSlug: string, params?: Filters) =>
  apiClient.api.workspaces[':workspaceSlug'].notes
    .$get({
      param: { workspaceSlug: workspaceSlug },
      query: { archived: `${params?.archived ?? false}`, nameSearch: params?.nameSearch },
    })
    .then(responseJson);

export const useWorkspaceNotes = (workspaceSlug: Accessor<string>, params?: Filters) => {
  return createQuery(() => ({
    queryKey: queryKeys.workspaceNotes(workspaceSlug()),
    queryFn: () => fetchWorkspaceNotes(workspaceSlug(), params),
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

export const useUpdateWorkspace = (workspaceSlug: string) => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (body: { name: string; private: boolean }) =>
      apiClient.api.workspaces[':workspaceSlug']
        .$patch({
          json: { ...body, access: body.private ? 'private' : 'public' },
          param: { workspaceSlug },
        })
        .then(responseJson),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces() });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspace(workspaceSlug) });
    },
    enabled: Boolean(workspaceSlug),
  }));
};
