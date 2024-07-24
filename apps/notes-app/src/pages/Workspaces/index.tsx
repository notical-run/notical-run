import { A } from '@solidjs/router';
import { useWorkspaces } from '@/api/queries/workspace';
import { Page } from '@/components/Page';
import { links } from '@/components/Navigation';
import { NewWorkspaceDialog } from '@/pages/Workspaces/components/NewWorkspaceDialog';
import { createSignal, For, Match, Switch } from 'solid-js';
import { Button } from '@/components/_base/Button';
import { FaSolidPlus } from 'solid-icons/fa';
import { List } from '@/components/_base/ListItems';
import { FiPlus } from 'solid-icons/fi';
import { LoadingView } from '@/components/ViewStates';

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

              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <FaSolidPlus size={10} /> New workspace
              </Button>
            </div>

            <Switch>
              <Match when={workspacesResult.isLoading}>
                <LoadingView subtitle="Loading workspaces" />
              </Match>

              <Match when={workspacesResult.data?.length === 0}>
                <List.Empty
                  title="You don't have any workspaces"
                  subtitle="Workspaces allow you to group notes together"
                >
                  <Button size="lg" onClick={() => setDialogOpen(true)} class="mt-4 w-full">
                    <FaSolidPlus size={10} /> Create a new workspace
                  </Button>
                </List.Empty>
              </Match>

              <Match when={true}>
                <List grid>
                  <For each={workspacesResult.data ?? []}>
                    {workspace => (
                      <List.Item>
                        <A href={links.workspaceNotes(workspace.slug)} class="block px-4 py-3">
                          <div class="pb-1">
                            <div class="text-xs text-slate-600">{workspace.name}</div>
                            <span class="text-slate-900 font-bold">@{workspace.slug}</span>
                          </div>
                          <div class="text-slate-600 text-sm">{workspace.notesCount} notes</div>
                        </A>
                      </List.Item>
                    )}
                  </For>

                  <List.Item class="border-dashed shadow-none">
                    <button
                      role="button"
                      onClick={() => setDialogOpen(true)}
                      class="w-full h-full px-4 py-4 flex flex-col gap-2 items-center justify-center text-slate-600"
                    >
                      <FiPlus size={20} />
                      <div class="text-sm">New workspace</div>
                    </button>
                  </List.Item>
                </List>
              </Match>
            </Switch>
          </div>

          <NewWorkspaceDialog open={dialogOpen()} onOpenChange={setDialogOpen} />
        </Page.Body.Main>
      </Page.Body>
    </Page>
  );
};

export default Workspaces;
