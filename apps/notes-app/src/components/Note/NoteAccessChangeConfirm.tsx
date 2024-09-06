import { NoteQueryResult, useUpdateNote } from '@/api/queries/note';
import { Alert } from '@/components/_base/Alert';
import { Button } from '@/components/_base/Button';
import { Dialog } from '@/components/_base/Dialog';
import { useDialogContext } from '@corvu/popover';
import { FaSolidTriangleExclamation } from 'solid-icons/fa';
import { ParentProps, Show } from 'solid-js';
import toast from 'solid-toast';

export type NoteAccessChangeConfirmProps = {
  workspaceSlug: string;
  noteId: string;
  noteAccess: NoteQueryResult['access'];
};

export const NoteAccessChangeConfirm = (props: ParentProps<NoteAccessChangeConfirmProps>) => {
  const noteUpdater = useUpdateNote(props.workspaceSlug, props.noteId, { invalidateCache: true });
  const dialogCtx = useDialogContext();

  const archive = () => {
    noteUpdater.mutate(
      { access: props.noteAccess },
      {
        onSuccess() {
          toast.success(`Note @${props.workspaceSlug}/${props.noteId} is now ${props.noteAccess}`);
          dialogCtx.setOpen(false);
        },
      },
    );
  };

  return (
    <Dialog>
      <Dialog.Trigger>{props.children}</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Content.Heading>
          <div class="flex justify-start items-center gap-3">
            <FaSolidTriangleExclamation class="text-yellow-600" />
            Make {props.noteId} {props.noteAccess}
          </div>
        </Dialog.Content.Heading>

        <Dialog.Content.Body class="text-slate-500 text-sm">
          Are you sure you want to make the note {props.noteAccess}?
          <div class="pt-4">
            <Show when={props.noteAccess === 'private'}>
              <Alert variant="warning">
                If there are other users linking/importing/referencing this note, making this note
                private may affect their notes
              </Alert>
            </Show>
          </div>
        </Dialog.Content.Body>

        <Dialog.Content.Footer>
          <Dialog.Close as={Button} variant="primary-bordered">
            Cancel
          </Dialog.Close>
          <Button onClick={archive}>
            {props.noteAccess === 'public' ? 'Make Public' : 'Make Private'}
          </Button>
        </Dialog.Content.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
