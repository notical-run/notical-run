import { useCreateWorkspace } from '@/api/queries/workspace';
import { Button } from '@/components/_base/Button';
import { Dialog, DialogRootProps } from '@/components/_base/Dialog';
import { TextInput } from '@/components/_base/TextInput';
import { links } from '@/components/Navigation';
import { useNavigate } from '@solidjs/router';
import toast from 'solid-toast';
import { createForm, SubmitHandler, zodForm } from '@modular-forms/solid';
import { z } from 'zod';
import { toApiErrorMessage } from '@/utils/api-client';
import { Show } from 'solid-js';

const workspaceSchema = z.object({
  name: z.string().min(1, 'Required'),
  slug: z
    .string()
    .min(1, 'Required')
    .max(50, 'ID is too long')
    .regex(/^[^\s]+$/, 'ID must not contain spaces')
    .regex(
      /^[a-z0-9_-]+$/,
      'ID can only contain alphanumeric characters, hyphens (-) and underscores (_)',
    ),
});

type WorkspaceSchemaType = z.infer<typeof workspaceSchema>;

export const NewWorkspaceDialog = (props: DialogRootProps) => {
  const navigate = useNavigate();

  const workspaceCreator = useCreateWorkspace();
  const [, { Form, Field }] = createForm<WorkspaceSchemaType>({
    validate: zodForm(workspaceSchema),
    validateOn: 'blur',
    revalidateOn: 'input',
  });

  const createWorkspace: SubmitHandler<WorkspaceSchemaType> = workspacePayload => {
    workspaceCreator.mutate(workspacePayload, {
      onSuccess: result => {
        props.onOpenChange(false);
        toast.success(`Workspace ${result.slug} created`);
        navigate(links.workspaceNotes(result.slug));
      },
    });
  };

  return (
    <Dialog {...props}>
      <Dialog.Content>
        <Dialog.Content.Heading>New workspace</Dialog.Content.Heading>
        <Dialog.Content.Body>
          <Form onSubmit={createWorkspace}>
            <Field name="name">
              {(store, props) => (
                <TextInput
                  {...props}
                  error={store.error}
                  label="Workspace name"
                  placeholder="Personal notes workspace"
                />
              )}
            </Field>

            <Field name="slug">
              {(store, props) => (
                <TextInput
                  {...props}
                  error={store.error}
                  name="slug"
                  label="Workspace ID"
                  placeholder="personal-notes-workspace"
                />
              )}
            </Field>

            <Show when={workspaceCreator.error}>
              <div class="text-xs text-right text-red-700 mt-2">
                {toApiErrorMessage(workspaceCreator.error)}
              </div>
            </Show>

            <Dialog.Content.Footer>
              <Dialog.Close as={Button} variant="primary-bordered">
                Cancel
              </Dialog.Close>

              <Button type="submit" disabled={workspaceCreator.isPending}>
                Create
              </Button>
            </Dialog.Content.Footer>
          </Form>
        </Dialog.Content.Body>
      </Dialog.Content>
    </Dialog>
  );
};
