import { createSignal, For, Match, Switch } from 'solid-js';
import { A } from '@solidjs/router';
import { useWorkspaceNotes } from '@/api/queries/workspace';
import { Page } from '@/components/Page';
import { links } from '@/components/Navigation';
import { Button } from '@/components/_base/Button';
import { NewNoteDialog } from '@/pages/WorkspaceNotes/components/NewNoteDialog';
import { useWorkspaceContext } from '@/layouts/workspace';
import { WorkspaceSelector } from '@/components/WorkspaceSelector';
import { FaSolidPlus } from 'solid-icons/fa';
import { List } from '@/components/_base/ListItems';
import { toApiErrorMessage } from '@/utils/api-client';
import { ErrorView, LoadingView } from '@/components/ViewStates';
import { AiOutlineLock } from 'solid-icons/ai';
import { NoteActionsDropdown } from '@/components/Note/NoteDropdown';

const WorkspaceNotes = () => {
  const { slug } = useWorkspaceContext();
  const notesQuery = useWorkspaceNotes(slug);

  const [dialogOpen, setDialogOpen] = createSignal(false);

  return (
    <Page title={`Notes in @${slug()}`}>
      <Page.Header breadcrumbs={[{ content: <WorkspaceSelector selected={slug()} /> }]} />
      <Page.Body>
        {/* <Page.Body.SideMenu>Wow</Page.Body.SideMenu> */}
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

                  <Button onClick={() => setDialogOpen(true)}>
                    <FaSolidPlus size={10} /> New note
                  </Button>
                </div>

                <List>
                  <For
                    each={notesQuery.data}
                    fallback={
                      <List.Empty
                        title="This workspace is empty"
                        subtitle="Create a new note to get started"
                      />
                    }
                  >
                    {note => (
                      <List.Item class="flex items-center px-2">
                        <A
                          href={links.workspaceNote(slug(), note.name)}
                          class="block px-2 py-3 flex-1"
                        >
                          <div class="flex items-center">
                            <span class="text-slate-500 text-xs">@{slug()}</span>
                            <span class="text-slate-500 text-md">/</span>
                            <span class="text-slate-900 font-bold">{note.name}</span>
                            {note.access === 'private' && (
                              <AiOutlineLock class="ml-2 text-yellow-700" />
                            )}
                          </div>
                        </A>
                        <NoteActionsDropdown workspaceSlug={slug()} noteId={note.name} />
                      </List.Item>
                    )}
                  </For>
                </List>
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
