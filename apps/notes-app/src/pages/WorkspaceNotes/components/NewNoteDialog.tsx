import { useCreateNote } from '@/api/queries/workspace';
import { Button } from '@/components/_base/Button';
import { Dialog, DialogRootProps } from '@/components/_base/Dialog';
import { TextInput } from '@/components/_base/TextInput';
import { links } from '@/components/Navigation';
import { useNavigate, useParams } from '@solidjs/router';

export const NewNoteDialog = (props: DialogRootProps) => {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const slug = workspaceSlug.replace(/^@/, '');

  const navigate = useNavigate();

  const createNoteMut = useCreateNote(slug);
  const createNote = (e: SubmitEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;

    if (!name || !/^[a-z][a-z0-9_-]+$/i.test(name)) return;

    createNoteMut.mutate(
      { name },
      {
        onSuccess: () => {
          props.onOpenChange(false);
          navigate(links.workspaceNote(slug, name));
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
              <Button class="text-sm" type="submit">
                Create
              </Button>
            </Dialog.Content.Footer>
          </form>
        </Dialog.Content.Body>
      </Dialog.Content>
    </Dialog>
  );
};
