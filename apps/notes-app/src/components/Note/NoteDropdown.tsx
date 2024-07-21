import { Popover } from '@/components/_base/Popover';
import { HiOutlineArchiveBoxXMark } from 'solid-icons/hi';
import { BsThreeDotsVertical } from 'solid-icons/bs';
import { NoteArchiveConfirm } from '@/components/Note/NoteArchiveConfirm';
import { Dialog } from '@/components/_base/Dialog';

type NoteDropdownProps = {
  workspaceSlug: string;
  noteId: string;
  onArchive?: () => void;
};

export const NoteActionsDropdown = (props: NoteDropdownProps) => {
  return (
    <>
      <Popover placement="bottom-end" offset={0}>
        <Popover.Trigger class="flex items-center justify-center size-8 mx-0 rounded-full hover:bg-slate-200">
          <BsThreeDotsVertical />
        </Popover.Trigger>

        <Popover.Content>
          <div class="listbox text-sm flex flex-col">
            <NoteArchiveConfirm
              workspaceSlug={props.workspaceSlug}
              noteId={props.noteId}
              onArchive={props.onArchive}
            >
              <Dialog.Trigger
                as={Popover.Close}
                role="listitem"
                class="flex flex-1 items-center justify-start gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100"
              >
                <HiOutlineArchiveBoxXMark />
                Archive
              </Dialog.Trigger>
            </NoteArchiveConfirm>
          </div>
        </Popover.Content>
      </Popover>
    </>
  );
};
