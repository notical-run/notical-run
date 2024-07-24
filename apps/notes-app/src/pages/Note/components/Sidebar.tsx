import { useWorkspaceNotes } from '@/api/queries/workspace';
import { links } from '@/components/Navigation';
import { Page } from '@/components/Page';
import { useLayoutContext } from '@/components/Page/layout';
import { useWorkspaceContext } from '@/layouts/workspace';
import { NewNoteDialog } from '@/pages/WorkspaceNotes/components/NewNoteDialog';
import { A } from '@solidjs/router';
import { AiOutlineLock } from 'solid-icons/ai';
import { BiSolidNote } from 'solid-icons/bi';
import { FaSolidPlus } from 'solid-icons/fa';
import { createSignal, For, Show } from 'solid-js';

export const NoteSidebar = () => {
  const { slug } = useWorkspaceContext();
  const notesQuery = useWorkspaceNotes(slug);
  const { sidebarOpen } = useLayoutContext();

  const [newNoteDialogOpen, setNewNoteDialogOpen] = createSignal(false);

  return (
    <>
      <Show when={sidebarOpen()}>
        <div class="px-2 py-3">
          <div class="text-slate-400 text-xs uppercase">Notes</div>

          <div class="flex flex-col mt-1">
            <For each={notesQuery.data ?? []}>
              {note => (
                <A
                  href={links.workspaceNote(slug(), note.name)}
                  class="flex items-center gap-2 px-2 text-sm py-1"
                  activeClass="text-slate-400 cursor-default"
                  inactiveClass="text-slate-600 hover:text-slate-900"
                >
                  {note.access === 'private' ? (
                    <AiOutlineLock size={14} class="text-yellow-700" />
                  ) : (
                    <BiSolidNote size={14} />
                  )}
                  {note.name}
                </A>
              )}
            </For>
          </div>
        </div>
      </Show>

      <Page.Body.SideMenuLink
        icon={<FaSolidPlus size={10} />}
        onClick={() => setNewNoteDialogOpen(true)}
      >
        New note
      </Page.Body.SideMenuLink>

      <NewNoteDialog open={newNoteDialogOpen()} onOpenChange={setNewNoteDialogOpen} />
    </>
  );
};
