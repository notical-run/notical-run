import { useUserWorkspaces } from '@/api/queries/workspace';
import { Button } from '@/components/_base/Button';
import { Popover } from '@/components/_base/Popover';
import { Link } from '@/components/Navigation';
import { createSignal, For } from 'solid-js';
import { RiArrowsArrowDownSLine } from 'solid-icons/ri';
import { FaSolidPlus } from 'solid-icons/fa';
import { NewWorkspaceDialog } from '@/pages/Workspaces/components/NewWorkspaceDialog';
import { Authorize } from '@/components/Auth/Session';
import { cn } from '@/utils/classname';
import { AiOutlineLock } from 'solid-icons/ai';

export type WorkspaceSelectorProps = { selected: string };

export const WorkspaceSelector = (props: WorkspaceSelectorProps) => {
  const workspaces = useUserWorkspaces();

  const [dialogOpen, setDialogOpen] = createSignal(false);

  return (
    <>
      <Popover>
        <div class="flex items-center gap-2">
          <Link.WorkspaceNotes slug={props.selected}>@{props.selected}</Link.WorkspaceNotes>

          <Authorize user="logged_in" workspace="manage">
            <Popover.Trigger class="flex items-center justify-center size-5 rounded-full hover:bg-slate-300">
              <RiArrowsArrowDownSLine size={14} />
            </Popover.Trigger>
          </Authorize>
        </div>

        <Popover.Content>
          <div class="min-w-60 shadow-lg text-sm">
            <Popover.Content.Heading class="text-slate-500 pb-2 hidden">
              Select workspace
            </Popover.Content.Heading>

            <Popover.Content.Body class="pt-1">
              <For
                each={workspaces.data}
                fallback={
                  <div class="text-center text-slate-400 text-sm p-2">
                    You don't have any workspaces
                  </div>
                }
              >
                {workspace => (
                  <Popover.Close
                    as={Link.WorkspaceNotes}
                    slug={workspace.slug}
                    class={cn(
                      'text-slate-700 w-full py-2 px-3',
                      'flex items-center justify-between gap-2',
                      {
                        'hover:bg-slate-100': props.selected !== workspace.slug,
                        '!text-slate-400': props.selected === workspace.slug,
                      },
                    )}
                    aria-disabled={props.selected === workspace.slug}
                  >
                    <span>@{workspace.slug}</span>
                    {workspace.access === 'private' && (
                      <AiOutlineLock size={14} class="text-yellow-700" />
                    )}
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
      </Popover>

      <NewWorkspaceDialog open={dialogOpen()} onOpenChange={setDialogOpen} />
    </>
  );
};
