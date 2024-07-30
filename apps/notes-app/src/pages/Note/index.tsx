import { Editor as TiptapEditor } from '@tiptap/core';
import { useNavigate, useParams } from '@solidjs/router';
import { useNote } from '../../api/queries/workspace';
import { createSignal, Match, Show, Switch } from 'solid-js';
import { useWorkspaceContext } from '@/context/workspace';
import { NoteEditor } from '@/pages/Note/components/NoteEditor';
import { LoadingView, ErrorView } from '@/components/ViewStates';
import { toApiErrorMessage } from '@/utils/api-client';
import { links } from '@/components/Navigation';
import { NoteActionsDropdown } from '@/components/Note/NoteDropdown';
import { Alert } from '@/components/_base/Alert';
import { FiArchive } from 'solid-icons/fi';

const WorkspaceNote = () => {
  const { slug } = useWorkspaceContext();
  const params = useParams<{ noteId: string }>();
  const noteQuery = useNote(slug, () => params.noteId);
  const navigate = useNavigate();
  const [editorInstance, setEditorInstance] = createSignal<TiptapEditor>();

  const formatDate = (date: string) => {
    const formatter = new Intl.DateTimeFormat('en-UK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return formatter.format(new Date(date));
  };

  return (
    <Switch>
      <Match when={noteQuery.isLoading}>
        <LoadingView />
      </Match>

      <Match when={noteQuery.isError}>
        <ErrorView title={toApiErrorMessage(noteQuery.error) ?? undefined} />
      </Match>

      <Match when={noteQuery.isSuccess}>
        <div class="px-2">
          <div class="mx-auto max-w-4xl">
            <Show when={noteQuery.data?.archivedAt}>
              <Alert variant="warning" class="mb-3" icon={<FiArchive />}>
                This note was archived on: {formatDate(noteQuery.data!.archivedAt!)}
              </Alert>
            </Show>

            <div class="flex justify-end items-center gap-2 text-sm text-slate-500">
              @{slug()}/{noteQuery.data?.name} by {noteQuery.data?.author?.name}
              <NoteActionsDropdown
                workspaceSlug={slug()}
                noteId={noteQuery.data!.name!}
                editor={editorInstance()}
                onArchive={() => navigate(links.workspaceNotes(slug()))}
              />
            </div>

            <Show when={noteQuery.data?.id} keyed>
              <NoteEditor note={noteQuery.data!} ref={setEditorInstance} />
            </Show>
          </div>
        </div>
      </Match>
    </Switch>
  );
};

export default WorkspaceNote;
