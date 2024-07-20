import { useCreateNote } from '@/api/queries/workspace';
import { Button } from '@/components/_base/Button';
import { Dialog, DialogRootProps } from '@/components/_base/Dialog';
import { TextInput } from '@/components/_base/TextInput';
import { links } from '@/components/Navigation';
import { useWorkspaceContext } from '@/layouts/workspace';
import { useNavigate } from '@solidjs/router';
import toast from 'solid-toast';
import { createForm, SubmitHandler, zodForm } from '@modular-forms/solid';
import { z } from 'zod';
import { Show } from 'solid-js';
import { toApiErrorMessage } from '@/utils/api-client';

const noteSchema = z.object({
  name: z
    .string()
    .min(1, 'Required')
    .max(50, 'Name is too long')
    .regex(/^[^\s]+$/, 'Name must not contain spaces')
    .regex(
      /^[a-z0-9_-]+$/,
      'Name can only contain alphanumeric characters, hyphens (-) and underscores (_)',
    ),
});

type NoteSchemaType = z.infer<typeof noteSchema>;

export const NewNoteDialog = (props: DialogRootProps) => {
  const { slug } = useWorkspaceContext();
  const navigate = useNavigate();

  const noteCreator = useCreateNote(slug);
  const [, { Form, Field }] = createForm<NoteSchemaType>({
    validate: zodForm(noteSchema),
    validateOn: 'blur',
    revalidateOn: 'input',
  });

  const createNote: SubmitHandler<NoteSchemaType> = payload => {
    noteCreator.mutate(payload, {
      onSuccess: result => {
        props.onOpenChange(false);
        toast.success(`Note ${result.name} created`);
        navigate(links.workspaceNote(slug(), result.name));
      },
    });
  };

  return (
    <Dialog {...props}>
      <Dialog.Content>
        <Dialog.Content.Heading>New note</Dialog.Content.Heading>
        <Dialog.Content.Body>
          <Form onSubmit={createNote}>
            <Field name="name">
              {(store, props) => (
                <TextInput {...props} error={store.error} label="Name" placeholder="my-note" />
              )}
            </Field>

            <Show when={noteCreator.error}>
              <div class="text-xs text-right text-red-700 mt-2">
                {toApiErrorMessage(noteCreator.error)}
              </div>
            </Show>

            <Dialog.Content.Footer>
              <Dialog.Close as={Button} variant="primary-bordered">
                Cancel
              </Dialog.Close>

              <Button type="submit" disabled={noteCreator.isPending}>
                Create
              </Button>
            </Dialog.Content.Footer>
          </Form>
        </Dialog.Content.Body>
      </Dialog.Content>
    </Dialog>
  );
};
