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
import { AiOutlineArrowLeft } from 'solid-icons/ai';

const ArchivedWorkspaceNotes = () => {
  const { slug } = useWorkspaceContext();
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
              <A
                href={links.workspaceNotes(slug())}
                class="text-xs flex items-center gap-2 text-slate-600 hover:text-slate-400"
              >
                <AiOutlineArrowLeft />
                Back to notes
              </A>
              <h1 class="text-slate-400 font-bold pt-1">Archived notes</h1>
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
