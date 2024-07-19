import { useCreateWorkspace } from '@/api/queries/workspace';
import { Button } from '@/components/_base/Button';
import { Dialog, DialogRootProps } from '@/components/_base/Dialog';
import { TextInput } from '@/components/_base/TextInput';
import { links } from '@/components/Navigation';
import { useNavigate } from '@solidjs/router';
import toast from 'solid-toast';

export const NewWorkspaceDialog = (props: DialogRootProps) => {
  const workspaceCreator = useCreateWorkspace();

  const navigate = useNavigate();

  const createNote = (e: SubmitEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;

    if (!slug || !/^[a-z][a-z0-9_-]+$/i.test(slug)) return;
    if (!name) return;

    workspaceCreator.mutate(
      { name, slug },
      {
        onSuccess: () => {
          props.onOpenChange(false);
          toast.success(`Workspace ${name} created`);
          navigate(links.workspaceNotes(slug));
        },
      },
    );
  };

  return (
    <Dialog {...props}>
      <Dialog.Content>
        <Dialog.Content.Heading>New workspace</Dialog.Content.Heading>
        <Dialog.Content.Body>
          <form onSubmit={createNote}>
            <TextInput name="name" placeholder="Workspace name (Eg: My workspace)" />

            <TextInput name="slug" placeholder="Workspace ID (Eg: my-workspace)" />

            <Dialog.Content.Footer>
              <Dialog.Close as={Button} class="text-sm">
                Cancel
              </Dialog.Close>
              <Button class="text-sm" type="submit" disabled={workspaceCreator.isPending}>
                {workspaceCreator.isPending ? 'Createing...' : 'Create'}
              </Button>
            </Dialog.Content.Footer>
          </form>
        </Dialog.Content.Body>
      </Dialog.Content>
    </Dialog>
  );
};
