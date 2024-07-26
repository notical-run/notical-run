import { Editor as TiptapEditor } from '@tiptap/core';
import { Popover } from '@/components/_base/Popover';
import { HiOutlineArchiveBoxXMark } from 'solid-icons/hi';
import { BsThreeDotsVertical } from 'solid-icons/bs';
import { NoteArchiveConfirm } from '@/components/Note/NoteArchiveConfirm';
import { Dialog } from '@/components/_base/Dialog';
import { Show } from 'solid-js';
import { FaBrandsMarkdown } from 'solid-icons/fa';
import toast from 'solid-toast';
import { Authorize } from '@/components/Auth/Session';

type NoteDropdownProps = {
  workspaceSlug: string;
  noteId: string;
  editor?: TiptapEditor;
  onArchive?: () => void;
};

export const NoteActionsDropdown = (props: NoteDropdownProps) => {
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
                <Dialog.Trigger
                  as={Popover.Close}
                  role="listitem"
                  class="flex flex-1 items-center justify-start gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 w-full"
                  onClick={copyAsMarkdown}
                >
                  <FaBrandsMarkdown />
                  Copy as markdown
                </Dialog.Trigger>
              </Show>

              <Authorize user="logged_in" workspace="view">
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
              </Authorize>
            </div>
          </Popover.Content.Body>
        </Popover.Content>
      </Popover>
    </>
  );
};
