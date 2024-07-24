import { createSignal, Match, Switch } from 'solid-js';
import { useWorkspaceNotes } from '@/api/queries/workspace';
import { Page } from '@/components/Page';
import { Button } from '@/components/_base/Button';
import { NewNoteDialog } from '@/pages/WorkspaceNotes/components/NewNoteDialog';
import { useWorkspaceContext } from '@/layouts/workspace';
import { WorkspaceSelector } from '@/components/WorkspaceSelector';
import { FaSolidPlus } from 'solid-icons/fa';
import { toApiErrorMessage } from '@/utils/api-client';
import { ErrorView, LoadingView } from '@/components/ViewStates';
import { NoteList } from '@/pages/WorkspaceNotes/components/NoteList';
import { List } from '@/components/_base/ListItems';
import { links } from '@/components/Navigation';
import { FiArchive } from 'solid-icons/fi';

const WorkspaceNotes = () => {
  const { slug } = useWorkspaceContext();
  const notesQuery = useWorkspaceNotes(slug);

  const [dialogOpen, setDialogOpen] = createSignal(false);

  return (
    <Page title={`Notes in @${slug()}`}>
      <Page.Header breadcrumbs={[{ content: <WorkspaceSelector selected={slug()} /> }]} />

      <Page.Body>
        <Page.Body.SideMenu>
          <Page.Body.SideMenuLink icon={<FiArchive />} href={links.archivedWorkspaceNotes(slug())}>
            Archived notes
          </Page.Body.SideMenuLink>
        </Page.Body.SideMenu>

        <Page.Body.Main>
          <div class="mx-auto max-w-4xl">
            <Switch>
              <Match when={notesQuery.isLoading}>
                <LoadingView />
              </Match>

              <Match when={notesQuery.isError}>
                <ErrorView title={toApiErrorMessage(notesQuery.error) ?? undefined} />
              </Match>

              <Match when={notesQuery.isSuccess}>
                <div class="flex justify-between items-end pb-2">
                  <h1 class="text-slate-400 font-bold">Notes</h1>

                  <Button size="sm" onClick={() => setDialogOpen(true)}>
                    <FaSolidPlus size={10} /> New note
                  </Button>
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
        </Page.Body.Main>
      </Page.Body>
    </Page>
  );
};

export default WorkspaceNotes;
