import { Editor as TiptapEditor } from '@tiptap/core';
import { Popover } from '@/components/_base/Popover';
import { HiOutlineArchiveBoxXMark } from 'solid-icons/hi';
import { BsThreeDotsVertical } from 'solid-icons/bs';
import { NoteArchiveConfirm } from '@/components/Note/NoteArchiveConfirm';
import { Dialog } from '@/components/_base/Dialog';
import { Match, Show, Switch } from 'solid-js';
import { FaBrandsMarkdown } from 'solid-icons/fa';
import toast from 'solid-toast';
import { Authorize } from '@/components/Auth/Session';
import { useNote } from '@/api/queries/workspace';
import { AiOutlineLock, AiOutlineUnlock } from 'solid-icons/ai';
import { NoteAccessChangeConfirm } from '@/components/Note/NoteAccessChangeConfirm';

type NoteDropdownProps = {
  workspaceSlug: string;
  noteId: string;
  editor?: TiptapEditor;
  onArchive?: () => void;
};

export const NoteActionsDropdown = (props: NoteDropdownProps) => {
  const noteQuery = useNote(
    () => props.workspaceSlug,
    () => props.noteId,
  );

  const copyAsMarkdown = async () => {
    const markdown = props.editor!.storage.markdown.getMarkdown() ?? '';
    await navigator.clipboard.writeText(markdown);
    toast.success('Copied markdown to clipboard');
  };

  return (
    <>
      <Popover placement="bottom-end" offset={0}>
        <Popover.Trigger class="flex items-center justify-center size-8 mx-0 rounded-full hover:bg-slate-200">
          <BsThreeDotsVertical />
        </Popover.Trigger>

        <Popover.Content>
          <Popover.Content.Body>
            <div class="text-sm flex flex-col" role="listbox">
              <Show when={props.editor}>
                <Popover.Close
                  role="listitem"
                  class="flex flex-1 items-center justify-start gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 w-full"
                  onClick={copyAsMarkdown}
                >
                  <FaBrandsMarkdown />
                  Copy as markdown
                </Popover.Close>
              </Show>

              <Authorize user="logged_in" workspace="view">
                <Show when={noteQuery.data?.id}>
                  <NoteAccessChangeConfirm
                    workspaceSlug={props.workspaceSlug}
                    noteId={noteQuery.data!.name!}
                    noteAccess={noteQuery.data!.access === 'private' ? 'public' : 'private'}
                  >
                    <Dialog.Trigger
                      as={Popover.Close}
                      role="listitem"
                      class="flex flex-1 items-center justify-start gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 w-full"
                    >
                      {noteQuery.data!.access === 'private' ? (
                        <>
                          <AiOutlineUnlock class="text-green-600" />
                          Make the note public
                        </>
                      ) : (
                        <>
                          <AiOutlineLock class="text-yellow-700" />
                          Make the note private
                        </>
                      )}
                    </Dialog.Trigger>
                  </NoteAccessChangeConfirm>
                </Show>
              </Authorize>

              <Authorize user="logged_in" workspace="view">
                <Switch>
                  <Match when={noteQuery.data?.archivedAt}>
                    <NoteArchiveConfirm
                      unarchive
                      workspaceSlug={props.workspaceSlug}
                      noteId={props.noteId}
                      onArchive={props.onArchive}
                    >
                      <Dialog.Trigger
                        as={Popover.Close}
                        role="listitem"
                        class="flex flex-1 items-center justify-start gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 w-full"
                      >
                        <HiOutlineArchiveBoxXMark />
                        Restore
                      </Dialog.Trigger>
                    </NoteArchiveConfirm>
                  </Match>

                  <Match when={noteQuery.data?.archivedAt === null}>
                    <NoteArchiveConfirm
                      workspaceSlug={props.workspaceSlug}
                      noteId={props.noteId}
                      onArchive={props.onArchive}
                    >
                      <Dialog.Trigger
                        as={Popover.Close}
                        role="listitem"
                        class="flex flex-1 items-center justify-start gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 w-full"
                      >
                        <HiOutlineArchiveBoxXMark />
                        Archive
                      </Dialog.Trigger>
                    </NoteArchiveConfirm>
                  </Match>
                </Switch>
              </Authorize>
            </div>
          </Popover.Content.Body>
        </Popover.Content>
      </Popover>
    </>
  );
};
