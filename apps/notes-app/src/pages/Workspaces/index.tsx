import { A } from '@solidjs/router';
import { useUserWorkspaces } from '@/api/queries/workspace';
import { links } from '@/components/Navigation';
import { NewWorkspaceDialog } from '@/pages/Workspaces/components/NewWorkspaceDialog';
import { createSignal, For, Match, Switch } from 'solid-js';
import { Button } from '@/components/_base/Button';
import { FaSolidPlus } from 'solid-icons/fa';
import { List } from '@/components/_base/ListItems';
import { FiPlus } from 'solid-icons/fi';
import { ErrorView, LoadingView } from '@/components/ViewStates';
import { toApiErrorMessage } from '@/utils/api-client';
import { AiOutlineLock } from 'solid-icons/ai';

const Workspaces = () => {
  const workspacesResult = useUserWorkspaces();

  const [newWorkspaceDialogOpen, setNewWorkspaceDialogOpen] = createSignal(false);

  return (
    <div>
      <div>
        <Switch>
          <Match when={workspacesResult.isLoading}>
            <LoadingView subtitle="Loading workspaces" />
          </Match>

          <Match when={workspacesResult.isError}>
            <ErrorView title={toApiErrorMessage(workspacesResult.error) ?? undefined} />
          </Match>

          <Match when={workspacesResult.isSuccess && workspacesResult.data?.length === 0}>
            <List.Empty
              title="You don't have any workspaces"
              subtitle="Workspaces allow you to group notes together"
            >
              <Button size="lg" onClick={() => setNewWorkspaceDialogOpen(true)} class="mt-4 w-full">
                <FaSolidPlus size={10} /> Create a new workspace
              </Button>
            </List.Empty>
          </Match>

          <Match when={workspacesResult.isSuccess}>
            <div class="flex items-end justify-between pb-2">
              <h1 class="text-slate-500 font-bold">My Workspaces</h1>

              <Button size="sm" onClick={() => setNewWorkspaceDialogOpen(true)}>
                <FaSolidPlus size={10} /> New workspace
              </Button>
            </div>

            <List grid class="animate-fade-in" aria-label="My workspaces">
              <For each={workspacesResult.data ?? []}>
                {workspace => (
                  <List.Item aria-label={`Workspace ${workspace.slug}`}>
                    <A href={links.workspaceNotes(workspace.slug)} class="block px-4 py-3">
                      <div class="pb-1">
                        <div class="text-xs text-slate-600">
                          <div class="flex items-center gap-2">
                            {workspace.access === 'private' && (
                              <AiOutlineLock size={14} class="text-yellow-700" />
                            )}
                            <span class="truncate">{workspace.name}</span>
                          </div>
                        </div>
                        <span class="text-slate-900 font-bold">@{workspace.slug}</span>
                      </div>
                      <div class="text-slate-600 text-sm">{workspace.notesCount} notes</div>
                    </A>
                  </List.Item>
                )}
              </For>

              <List.Item class="border-dashed shadow-none">
                <Button
                  variant="plain"
                  onClick={() => setNewWorkspaceDialogOpen(true)}
                  class="w-full h-full px-4 py-4 flex flex-col gap-2 items-center justify-center text-slate-600"
                >
                  <FiPlus size={20} />
                  <div class="text-sm">New workspace</div>
                </Button>
              </List.Item>
            </List>
          </Match>
        </Switch>
      </div>

      <NewWorkspaceDialog
        open={newWorkspaceDialogOpen()}
        onOpenChange={setNewWorkspaceDialogOpen}
      />
    </div>
  );
};

export default Workspaces;
