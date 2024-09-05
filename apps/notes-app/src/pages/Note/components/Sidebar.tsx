import { useWorkspaceNotes } from '@/api/queries/workspace';
import { Authorize } from '@/components/Auth/Session';
import { Link } from '@/components/Navigation';
import { Page } from '@/components/Page';
import { useLayoutContext } from '@/components/Page/layout';
import { useWorkspaceContext } from '@/context/workspace';
import { NewNoteDialog } from '@/pages/WorkspaceNotes/components/NewNoteDialog';
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
                <Link.Note
                  slug={slug()}
                  noteId={note.name}
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
                </Link.Note>
              )}
            </For>
          </div>
        </div>
      </Show>

      <Authorize user="logged_in" workspace="manage">
        <Page.Body.SideMenuLink
          icon={<FaSolidPlus size={10} />}
          onClick={() => setNewNoteDialogOpen(true)}
        >
          New note
        </Page.Body.SideMenuLink>
      </Authorize>

      <NewNoteDialog open={newNoteDialogOpen()} onOpenChange={setNewNoteDialogOpen} />
    </>
  );
};
