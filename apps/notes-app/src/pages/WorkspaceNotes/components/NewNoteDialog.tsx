import { useCreateNote } from '@/api/queries/workspace';
import { Button } from '@/components/_base/Button';
import { Dialog, DialogRootProps } from '@/components/_base/Dialog';
import { TextInput } from '@/components/_base/TextInput';
import { links } from '@/components/Navigation';
import { useWorkspaceContext } from '@/layouts/workspace';
import { useNavigate } from '@solidjs/router';
import toast from 'solid-toast';

export const NewNoteDialog = (props: DialogRootProps) => {
  const { slug } = useWorkspaceContext();

  const navigate = useNavigate();

  const createNoteMutation = useCreateNote(slug);

  const createNote = (e: SubmitEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;

    if (!name || !/^[a-z][a-z0-9_-]+$/i.test(name)) return;

    createNoteMutation.mutate(
      { name },
      {
        onSuccess: () => {
          props.onOpenChange(false);
          toast.success(`Note ${name} created`);
          navigate(links.workspaceNote(slug(), name));
        },
      },
    );
  };

  return (
    <Dialog {...props}>
      <Dialog.Content>
        <Dialog.Content.Heading>New note</Dialog.Content.Heading>
        <Dialog.Content.Body>
          <form onSubmit={createNote}>
            <TextInput name="name" placeholder="Note name (Eg: my-note)" />

            <Dialog.Content.Footer>
              <Dialog.Close as={Button} class="text-sm">
                Cancel
              </Dialog.Close>
              <Button class="text-sm" type="submit" disabled={createNoteMutation.isPending}>
                {createNoteMutation.isPending ? 'Createing...' : 'Create'}
              </Button>
            </Dialog.Content.Footer>
          </form>
        </Dialog.Content.Body>
      </Dialog.Content>
    </Dialog>
  );
};
