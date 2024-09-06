import { queryKeys } from '@/api/keys';
import { apiClient, responseJson } from '@/utils/api-client';
import { QueryResponseType } from '@/utils/solid-helpers';
import { createQuery, useQueryClient, createMutation } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';

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
    onSuccess(_, variables) {
      if (invalidateCache) {
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaceNotes(workspaceSlug) });
        queryClient.invalidateQueries({ queryKey: queryKeys.note(workspaceSlug, noteId) });
      } else {
        queryClient.setQueryData(
          queryKeys.note(workspaceSlug, noteId),
          (data: NoteQueryResult): NoteQueryResult => ({
            ...data,
            ...variables,
          }),
        );
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
