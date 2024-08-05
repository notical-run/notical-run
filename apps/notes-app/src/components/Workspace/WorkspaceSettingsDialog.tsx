import { useUpdateWorkspace } from '@/api/queries/workspace';
import { Button } from '@/components/_base/Button';
import { Dialog, DialogRootProps } from '@/components/_base/Dialog';
import { TextInput } from '@/components/_base/TextInput';
import toast from 'solid-toast';
import { createForm, SubmitHandler, zodForm } from '@modular-forms/solid';
import { z } from 'zod';
import { toApiErrorMessage } from '@/utils/api-client';
import { createEffect, Show } from 'solid-js';
import { HelpInfo } from '@/components/_base/Tooltip/HelpInfo';
import { SwitchInput } from '@/components/_base/SwitchInput';
import { AiOutlineLock, AiOutlineUnlock } from 'solid-icons/ai';
import { FiSettings } from 'solid-icons/fi';
import { useWorkspaceContext } from '@/context/workspace';

const workspaceSchema = z.object({
  name: z.string().min(1, 'Required').max(120, 'Maximum length is 120 characters'),
  private: z.boolean(),
});

type WorkspaceSchemaType = z.infer<typeof workspaceSchema>;

export const WorkspaceSettingsDialog = (props: DialogRootProps) => {
  const { workspace, slug } = useWorkspaceContext();

  const workspaceUpdater = useUpdateWorkspace(slug());
  const [workspaceForm, { Form, Field }] = createForm<WorkspaceSchemaType>({
    initialValues: {},
    validate: zodForm(workspaceSchema),
    validateOn: 'blur',
    revalidateOn: 'input',
  });

  createEffect(() => {
    workspaceForm.internal.fieldNames.get();
    workspaceForm.internal.fields.name?.value.set(workspace()?.name);
    workspaceForm.internal.fields.private?.value.set(workspace()?.access == 'private');
  });

  const updateWorkspace: SubmitHandler<WorkspaceSchemaType> = workspacePayload => {
    workspaceUpdater.mutate(workspacePayload, {
      onSuccess: result => {
        props.onOpenChange?.(false);
        toast.success(`Workspace ${result.slug} updated`);
      },
    });
  };

  return (
    <Dialog {...props}>
      <Dialog.Content>
        <Dialog.Content.Heading>
          <FiSettings />
          Workspace Settings
        </Dialog.Content.Heading>

        <Dialog.Content.Body class="pt-1">
          <Form onSubmit={updateWorkspace}>
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
                        Private workspace
                      </div>
                      <HelpInfo>
                        Private workspace cannot be viewed by any other user.
                        <strong class="block">
                          (Public notes inside the workspace can still be accessed by other users)
                        </strong>
                      </HelpInfo>
                    </div>
                  }
                  checked={store.value || false}
                  class="mt-2"
                />
              )}
            </Field>

            <Show when={workspaceUpdater.error}>
              <div class="text-xs text-right text-red-700 mt-2">
                {toApiErrorMessage(workspaceUpdater.error)}
              </div>
            </Show>

            <Dialog.Content.Footer>
              <Dialog.Close as={Button} variant="primary-bordered">
                Cancel
              </Dialog.Close>

              <Button type="submit" disabled={workspaceUpdater.isPending}>
                Save
              </Button>
            </Dialog.Content.Footer>
          </Form>
        </Dialog.Content.Body>
      </Dialog.Content>
    </Dialog>
  );
};
