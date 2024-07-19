import { createSignal, For, Show } from 'solid-js';
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

const WorkspaceNotes = () => {
  const { slug } = useWorkspaceContext();
  const notesQuery = useWorkspaceNotes(slug);

  const [dialogOpen, setDialogOpen] = createSignal(false);

  return (
    <Page>
      <Page.Header breadcrumbs={[{ content: <WorkspaceSelector selected={slug()} /> }]} />
      <Page.Body>
        {/* <Page.Body.SideMenu>Wow</Page.Body.SideMenu> */}
        <Page.Body.Main>
          <div class="mx-auto max-w-4xl">
            <div class="flex justify-between items-end pb-2">
              <h1 class="text-slate-400 font-bold">Notes</h1>

              <Button onClick={() => setDialogOpen(true)} class="flex items-center gap-2">
                <FaSolidPlus size={10} />
                New note
              </Button>
            </div>

            <Show when={!notesQuery.isLoading} fallback={<div>Loading...</div>}>
              <List>
                <For
                  each={notesQuery.data}
                  fallback={<List.Empty>This workspace is empty</List.Empty>}
                >
                  {note => (
                    <List.Item>
                      <A href={links.workspaceNote(slug(), note.name)} class="block px-4 py-3">
                        <div class="flex items-center">
                          <span class="text-slate-500 text-xs">@{slug()}</span>
                          <span class="text-slate-500 text-md">/</span>
                          <span class="text-slate-900 font-bold">{note.name}</span>
                        </div>
                      </A>
                    </List.Item>
                  )}
                </For>
              </List>
            </Show>
          </div>

          <NewNoteDialog open={dialogOpen()} onOpenChange={setDialogOpen} />
        </Page.Body.Main>
      </Page.Body>
    </Page>
  );
};

export default WorkspaceNotes;
