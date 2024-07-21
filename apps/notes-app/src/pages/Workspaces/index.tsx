import { A } from '@solidjs/router';
import { useWorkspaces } from '@/api/queries/workspace';
import { Page } from '@/components/Page';
import { links } from '@/components/Navigation';
import { NewWorkspaceDialog } from '@/pages/Workspaces/components/NewWorkspaceDialog';
import { createSignal, For } from 'solid-js';
import { Button } from '@/components/_base/Button';
import { FaSolidPlus } from 'solid-icons/fa';
import { List } from '@/components/_base/ListItems';

const Workspaces = () => {
  const workspacesResult = useWorkspaces();

  const [dialogOpen, setDialogOpen] = createSignal(false);

  return (
    <Page title="My workspaces">
      <Page.Header />
      <Page.Body>
        <Page.Body.Main>
          <div class="mx-auto max-w-4xl">
            <div class="flex items-end justify-between pb-2">
              <h1 class="text-slate-400 font-bold">My Workspaces</h1>

              <Button onClick={() => setDialogOpen(true)}>
                <FaSolidPlus size={10} /> New workspace
              </Button>
            </div>

            <List>
              <For
                each={workspacesResult.data ?? []}
                fallback={
                  <List.Empty
                    title="You don't have any workspaces"
                    subtitle="Create a workspace to get started"
                  />
                }
              >
                {workspace => (
                  <List.Item>
                    <A href={links.workspaceNotes(workspace.slug)} class="block px-4 py-3">
                      <div class="pb-1">
                        {workspace.name} (
                        <span class="text-slate-900 font-bold">@{workspace.slug}</span>)
                      </div>
                      <div class="text-slate-600 text-sm">{workspace.notes.length} notes</div>
                    </A>
                  </List.Item>
                )}
              </For>
            </List>
          </div>

          <NewWorkspaceDialog open={dialogOpen()} onOpenChange={setDialogOpen} />
        </Page.Body.Main>
      </Page.Body>
    </Page>
  );
};

export default Workspaces;
