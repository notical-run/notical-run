import { useCreateNote } from '@/api/queries/note';
import { Button } from '@/components/_base/Button';
import { Dialog, DialogRootProps } from '@/components/_base/Dialog';
import { TextInput } from '@/components/_base/TextInput';
import { links } from '@/components/Navigation';
import { useWorkspaceContext } from '@/context/workspace';
import { useNavigate } from '@solidjs/router';
import toast from 'solid-toast';
import { createForm, SubmitHandler, zodForm } from '@modular-forms/solid';
import { z } from 'zod';
import { createSignal, ParentProps, Show } from 'solid-js';
import { toApiErrorMessage } from '@/utils/api-client';
import { SwitchInput } from '@/components/_base/SwitchInput';
import { HelpInfo } from '@/components/_base/Tooltip/HelpInfo';
import { AiOutlineLock, AiOutlineUnlock } from 'solid-icons/ai';

const noteSchema = z.object({
  name: z
    .string()
    .min(1, 'Required')
    .max(50, 'Name is too long')
    .regex(/^[^\s]+$/, 'Name must not contain spaces')
    .regex(
      /^[a-z0-9_-]+$/i,
      'Name can only contain alphanumeric characters, hyphens (-) and underscores (_)',
    ),
  private: z.boolean(),
});

type NoteSchemaType = z.infer<typeof noteSchema>;

export const NewNoteDialog = (props: ParentProps<DialogRootProps>) => {
  const [dialogOpen, setDialogOpen] = createSignal(false);
  const { slug } = useWorkspaceContext();
  const navigate = useNavigate();

  const noteCreator = useCreateNote(slug);
  const [formStore, { Form, Field }] = createForm<NoteSchemaType>({
    initialValues: { private: true },
    validate: zodForm(noteSchema),
    validateOn: 'blur',
    revalidateOn: 'input',
  });

  const createNote: SubmitHandler<NoteSchemaType> = payload => {
    noteCreator.mutate(payload, {
      onSuccess: result => {
        setDialogOpen(false);
        props.onOpenChange?.(false);
        toast.success(`Note ${result.name} created`);
        navigate(links.workspaceNote(slug(), result.name));
      },
    });
  };

  return (
    <Dialog
      initialFocusEl={formStore.internal.fields.name?.elements.get()[0]}
      open={dialogOpen()}
      onOpenChange={setDialogOpen}
      {...props}
    >
      {props.children}
      <Dialog.Content>
        <Dialog.Content.Heading>New note</Dialog.Content.Heading>
        <Dialog.Content.Body>
          <Form onSubmit={createNote}>
            <Field name="name">
              {(store, props) => (
                <TextInput
                  {...props}
                  error={store.error}
                  value={store.value || ''}
                  aria-label="Note ID"
                  label={
                    <div class="flex items-center gap-2">
                      Note ID
                      <HelpInfo>
                        Note ID used to reference the note in urls, imports, etc. It can only
                        contain alphanumeric characters, hyphens (-) and underscores (_)
                      </HelpInfo>
                    </div>
                  }
                  placeholder="my-note"
                />
              )}
            </Field>

            <Field name="private" type="boolean">
              {(store, props) => (
                <SwitchInput
                  {...props}
                  error={store.error}
                  label={
                    <div class="flex items-center gap-2">
                      <div class="flex items-center gap-1">
                        {store.value ? (
                          <AiOutlineLock class="text-yellow-700" />
                        ) : (
                          <AiOutlineUnlock class="text-green-600" />
                        )}
                        Private note
                      </div>
                      <HelpInfo>
                        Private notes cannot be read, referenced or imported by any other user
                      </HelpInfo>
                    </div>
                  }
                  checked={store.value || false}
                  class="mt-2"
                />
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
