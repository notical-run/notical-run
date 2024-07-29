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
import { createEffect, Show } from 'solid-js';
import slugify from 'slugify';
import { HelpInfo } from '@/components/_base/Tooltip/HelpInfo';

const workspaceSchema = z.object({
  name: z.string().min(1, 'Required'),
  slug: z
    .string()
    .min(1, 'Required')
    .max(50, 'ID is too long')
    .regex(/^[^\s]+$/, 'ID must not contain spaces')
    .regex(
      /^[a-z0-9_-]+$/,
      'ID can only contain lowercase alphanumeric characters, hyphens (-) and underscores (_)',
    ),
});

type WorkspaceSchemaType = z.infer<typeof workspaceSchema>;

export const NewWorkspaceDialog = (props: DialogRootProps) => {
  const navigate = useNavigate();

  const workspaceCreator = useCreateWorkspace();
  const [workspaceForm, { Form, Field }] = createForm<WorkspaceSchemaType>({
    initialValues: { name: '', slug: '' },
    validate: zodForm(workspaceSchema),
    validateOn: 'blur',
    revalidateOn: 'input',
  });

  const createWorkspace: SubmitHandler<WorkspaceSchemaType> = workspacePayload => {
    workspaceCreator.mutate(workspacePayload, {
      onSuccess: result => {
        props.onOpenChange?.(false);
        toast.success(`Workspace ${result.slug} created`);
        navigate(links.workspaceNotes(result.slug));
      },
    });
  };

  createEffect(() => {
    workspaceForm.internal.fieldNames.get(); // Listen to field name being registered
    const fields = workspaceForm.internal.fields;

    const name = fields.name?.value.get();
    if (!fields.slug?.touched.get()) {
      fields.slug?.value.set(
        slugify(name ?? '', {
          strict: true,
          trim: true,
          lower: true,
          replacement: '-',
        }),
      );
    }
  });

  return (
    <Dialog {...props}>
      <Dialog.Content>
        <Dialog.Content.Heading>New workspace</Dialog.Content.Heading>
        <Dialog.Content.Body>
          <Form onSubmit={createWorkspace}>
            <Field name="name" type="string">
              {(store, props) => (
                <TextInput
                  {...props}
                  error={store.error}
                  value={store.value || ''}
                  aria-label="Workspace name"
                  label="Workspace name:"
                  placeholder="Personal notes workspace"
                />
              )}
            </Field>

            <Field name="slug" type="string">
              {(store, props) => (
                <TextInput
                  {...props}
                  error={store.error}
                  value={store.value || ''}
                  name="slug"
                  aria-label="Workspace ID"
                  label={
                    <div class="flex items-center gap-2">
                      Workspace ID:
                      <HelpInfo>
                        ID used to reference your workspace. It can only contain alphanumeric
                        characters, hyphens (-) and underscores (_)
                      </HelpInfo>
                    </div>
                  }
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
