import { Button } from '@/components/_base/Button';
import { Dialog } from '@/components/_base/Dialog';

type ConfirmModalProps = {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmModal = (props: ConfirmModalProps) => {
  return (
    <Dialog open onOpenChange={o => !o && props.onCancel()}>
      <Dialog.Content>
        <Dialog.Content.Heading>{props.title}</Dialog.Content.Heading>
        <Dialog.Content.Footer>
          <Button type="button" variant="primary-bordered" onClick={() => props.onCancel()}>
            No
          </Button>
          <Button type="submit" variant="primary" onClick={() => props.onConfirm()}>
            Yes
          </Button>
        </Dialog.Content.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
