import { Button } from '@/components/_base/Button';
import { Dialog } from '@/components/_base/Dialog';
import { TextInput } from '@/components/_base/TextInput';

type PromptModalProps = {
  title: string;
  onSubmit: (value: string | null | undefined) => void;
};

export const PromptModal = (props: PromptModalProps) => {
  const onSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const value = formData.get('value')?.toString() || '';
    props.onSubmit(value);
  };

  return (
    <Dialog open onOpenChange={o => !o && props.onSubmit(null)}>
      <Dialog.Content>
        <form onSubmit={onSubmit}>
          <Dialog.Content.Heading>{props.title}</Dialog.Content.Heading>
          <Dialog.Content.Body>
            <TextInput name="value" placeholder="Enter value" />
          </Dialog.Content.Body>
          <Dialog.Content.Footer>
            <Button type="button" variant="primary-bordered" onClick={() => props.onSubmit(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              OK
            </Button>
          </Dialog.Content.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
};
