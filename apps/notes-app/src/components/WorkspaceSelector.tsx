import { useWorkspaces } from '@/api/queries/workspace';
import { Button } from '@/components/_base/Button';
import { Popover } from '@/components/_base/Popover';
import { links } from '@/components/Navigation';
import { A } from '@solidjs/router';
import { createSignal, For } from 'solid-js';
import { RiArrowsArrowDownSLine } from 'solid-icons/ri';
import { FaSolidPlus } from 'solid-icons/fa';
import { NewWorkspaceDialog } from '@/pages/Workspaces/components/NewWorkspaceDialog';

export type WorkspaceSelectorProps = { selected: string };

export const WorkspaceSelector = (props: WorkspaceSelectorProps) => {
  const workspaces = useWorkspaces();

  const [dialogOpen, setDialogOpen] = createSignal(false);

  return (
    <>
      <Popover.Root>
        <div class="flex items-center gap-2">
          <A href={links.workspaceNotes(props.selected)}>@{props.selected}</A>
          <Popover.Trigger class="flex items-center justify-center size-5 rounded-full hover:bg-slate-300">
            <RiArrowsArrowDownSLine size={14} />
          </Popover.Trigger>
        </div>

        <Popover.Content>
          <div class="min-w-60 shadow-lg text-sm">
            <Popover.Content.Heading class="text-slate-500 pb-2 hidden">
              Select workspace
            </Popover.Content.Heading>

            <Popover.Content.Body class="pt-1">
              <For each={workspaces.data} fallback={<div>You don't have any workspaces</div>}>
                {workspace => (
                  <Popover.Close
                    as={A}
                    href={links.workspaceNotes(workspace.slug)}
                    classList={{
                      'text-slate-900 block w-full py-2 px-3': true,
                      'hover:bg-slate-100': props.selected !== workspace.slug,
                      '!text-slate-400': props.selected === workspace.slug,
                      'flex justify-between items-center gap-5': true,
                    }}
                    aria-disabled={props.selected === workspace.slug}
                  >
                    <span>@{workspace.slug}</span>
                  </Popover.Close>
                )}
              </For>

              <div class="p-1">
                <Popover.Close
                  as={Button}
                  size="sm"
                  class="w-full flex gap-1 justify-center items-center"
                  onClick={() => setDialogOpen(true)}
                >
                  <FaSolidPlus size={10} />
                  <span>Create workspace</span>
                </Popover.Close>
              </div>
            </Popover.Content.Body>
          </div>
        </Popover.Content>
      </Popover.Root>

      <NewWorkspaceDialog open={dialogOpen()} onOpenChange={setDialogOpen} />
    </>
  );
};
