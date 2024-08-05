import { createSignal, Match, Switch } from 'solid-js';
import { useWorkspaceNotes } from '@/api/queries/workspace';
import { Button } from '@/components/_base/Button';
import { NewNoteDialog } from '@/pages/WorkspaceNotes/components/NewNoteDialog';
import { useWorkspaceContext } from '@/context/workspace';
import { FaSolidPlus } from 'solid-icons/fa';
import { toApiErrorMessage } from '@/utils/api-client';
import { ErrorView, LoadingView } from '@/components/ViewStates';
import { NoteList } from '@/pages/WorkspaceNotes/components/NoteList';
import { List } from '@/components/_base/ListItems';
import { Authorize } from '@/components/Auth/Session';

const WorkspaceNotes = () => {
  const { slug, workspace } = useWorkspaceContext();
  const notesQuery = useWorkspaceNotes(slug);

  const [dialogOpen, setDialogOpen] = createSignal(false);

  return (
    <>
      <div class="mx-auto max-w-4xl">
        <Switch>
          <Match when={notesQuery.isLoading}>
            <LoadingView />
          </Match>

          <Match when={notesQuery.isError}>
            <ErrorView title={toApiErrorMessage(notesQuery.error) ?? undefined} />
          </Match>

          <Match when={notesQuery.isSuccess}>
            <div class="truncate text-xs text-slate-400 w-full max-w-60">{workspace()?.name}</div>
            <div class="flex justify-between items-end pb-2">
              <h1 class="text-slate-500 font-bold">Notes</h1>

              <Authorize user="logged_in" workspace="create_notes">
                <Button size="sm" onClick={() => setDialogOpen(true)}>
                  <FaSolidPlus size={10} /> New note
                </Button>
              </Authorize>
            </div>

            <NoteList
              notes={notesQuery.data!}
              fallback={
                <List.Empty
                  title="This workspace is empty"
                  subtitle="Create a new note to get started"
                >
                  <Button size="lg" onClick={() => setDialogOpen(true)} class="mt-4 w-full">
                    <FaSolidPlus size={10} /> Create a new note
                  </Button>
                </List.Empty>
              }
            />
          </Match>
        </Switch>
      </div>

      <NewNoteDialog open={dialogOpen()} onOpenChange={setDialogOpen} />
    </>
  );
};

export default WorkspaceNotes;
