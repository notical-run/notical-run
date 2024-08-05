import { createSignal, Match, Switch } from 'solid-js';
import { useWorkspaceNotes } from '@/api/queries/workspace';
import { NewNoteDialog } from '@/pages/WorkspaceNotes/components/NewNoteDialog';
import { useWorkspaceContext } from '@/context/workspace';
import { toApiErrorMessage } from '@/utils/api-client';
import { ErrorView, LoadingView } from '@/components/ViewStates';
import { NoteList } from '@/pages/WorkspaceNotes/components/NoteList';
import { List } from '@/components/_base/ListItems';
import { A } from '@solidjs/router';
import { links } from '@/components/Navigation';
import { FaSolidAngleLeft } from 'solid-icons/fa';

const ArchivedWorkspaceNotes = () => {
  const { slug, workspace } = useWorkspaceContext();
  const notesQuery = useWorkspaceNotes(slug, { archived: true });

  const [dialogOpen, setDialogOpen] = createSignal(false);

  return (
    <>
      <div class="mx-auto max-w-4xl">
        <Switch>
          <Match when={notesQuery.isLoading}>
            <LoadingView title="Loading archived notes" />
          </Match>

          <Match when={notesQuery.isError}>
            <ErrorView title={toApiErrorMessage(notesQuery.error) ?? undefined} />
          </Match>

          <Match when={notesQuery.isSuccess && notesQuery.data}>
            <div class="pb-2">
              <div class="flex gap-2 items-center">
                <A
                  href={links.workspaceNotes(slug())}
                  class="text-xs flex items-center gap-2 text-slate-800 hover:bg-slate-200 px-2 py-1 rounded"
                >
                  <FaSolidAngleLeft />
                  Back
                </A>

                <div class="truncate text-xs text-slate-400 max-w-60">{workspace()?.name}</div>
              </div>
              <h1 class="text-slate-500 font-bold pt-2">Archived notes</h1>
            </div>

            <NoteList
              notes={notesQuery.data!}
              fallback={<List.Empty title="You have no archived notes" />}
            />
          </Match>
        </Switch>
      </div>

      <NewNoteDialog open={dialogOpen()} onOpenChange={setDialogOpen} />
    </>
  );
};

export default ArchivedWorkspaceNotes;
