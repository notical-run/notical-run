import { useArchiveNote, useUnarchiveNote } from '@/api/queries/workspace';
import { Button } from '@/components/_base/Button';
import { Dialog } from '@/components/_base/Dialog';
import { useDialogContext } from '@corvu/popover';
import { FaSolidTriangleExclamation } from 'solid-icons/fa';
import { ParentProps } from 'solid-js';
import toast from 'solid-toast';

export type NoteArchiveConfirmProps = {
  unarchive?: boolean;
  workspaceSlug: string;
  noteId: string;
  onArchive?: () => void;
};

export const NoteArchiveConfirm = (props: ParentProps<NoteArchiveConfirmProps>) => {
  const noteArchiver = useArchiveNote(props.workspaceSlug, props.noteId);
  const noteUnarchiver = useUnarchiveNote(props.workspaceSlug, props.noteId);
  const dialogCtx = useDialogContext();

  const archive = () => {
    if (props.unarchive) {
      noteUnarchiver.mutate(undefined, {
        onSuccess() {
          toast.success(`Note @${props.workspaceSlug}/${props.noteId} has been restored`);
          dialogCtx.setOpen(false);
          props.onArchive?.();
        },
      });
    } else {
      noteArchiver.mutate(undefined, {
        onSuccess() {
          toast.success(`Note @${props.workspaceSlug}/${props.noteId} has been archived`);
          dialogCtx.setOpen(false);
          props.onArchive?.();
        },
      });
    }
  };

  return (
    <Dialog>
      <Dialog.Trigger>{props.children}</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Content.Heading>
          <div class="flex justify-start items-center gap-3">
            <FaSolidTriangleExclamation class="text-yellow-600" />
            {props.unarchive ? 'Restore' : 'Archive'} {props.noteId}
          </div>
        </Dialog.Content.Heading>
        <Dialog.Content.Body class="text-slate-500 text-sm">
          Are you sure you want to {props.unarchive ? 'restore' : 'archive'}
          {` @${props.workspaceSlug}/${props.noteId}`}?
        </Dialog.Content.Body>
        <Dialog.Content.Footer>
          <Dialog.Close as={Button} variant="primary-bordered">
            Cancel
          </Dialog.Close>
          <Button onClick={archive}>{props.unarchive ? 'Restore' : 'Archive'}</Button>
        </Dialog.Content.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
