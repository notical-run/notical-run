import { Button } from '@/components/_base/Button';
import { Dialog } from '@/components/_base/Dialog';
import { TextInput } from '@/components/_base/TextInput';
import { createForm, SubmitHandler, zodForm } from '@modular-forms/solid';
import { FaSolidLink, FaSolidLinkSlash } from 'solid-icons/fa';
import { createEffect, createSignal, ParentProps } from 'solid-js';
import { z } from 'zod';

export const UpdateLinkModal = (
  props: ParentProps & { getValue: () => string; onSubmit: (value: string | null) => void },
) => {
  const [isOpen, setIsOpen] = createSignal<boolean>(false);
  const [linkForm, { Form, Field }] = createForm<{ link: string }>({
    initialValues: { link: props.getValue() },
    validate: zodForm(z.object({ link: z.string().url() })),
    validateOn: 'input',
    revalidateOn: 'input',
  });

  createEffect(() => {
    linkForm.internal.fieldNames.get(); // Dependency for form field being registered
    isOpen() && linkForm.internal.fields.link?.value.set(props.getValue());
  });

  const onSubmit: SubmitHandler<{ link: string }> = payload => {
    props.onSubmit(payload.link);
    setIsOpen(false);
  };

  const clearLink = () => {
    props.onSubmit(null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen()} onOpenChange={b => setIsOpen(b)}>
      {props.children}
      <Dialog.Content>
        <Dialog.Content.Heading>
          <FaSolidLink />
          Update link
        </Dialog.Content.Heading>

        <Form onSubmit={onSubmit}>
          <Dialog.Content.Body>
            <Field name="link">
              {(store, props) => (
                <TextInput {...props} error={store.error} value={store.value || ''} label="Link" />
              )}
            </Field>
          </Dialog.Content.Body>

          <Dialog.Content.Footer>
            <Dialog.Close as={Button} variant="primary-bordered" onClick={clearLink}>
              <FaSolidLinkSlash />
              Unset link
            </Dialog.Close>

            <Button type="submit" disabled={linkForm.invalid}>
              <FaSolidLink />
              Update link
            </Button>
          </Dialog.Content.Footer>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};
