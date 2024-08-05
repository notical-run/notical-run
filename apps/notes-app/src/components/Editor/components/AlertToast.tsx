import { onMount } from 'solid-js';
import toast from 'solid-toast';

type AlertToastProps = {
  title: string;
  onClose: () => void;
};

export const AlertToast = (props: AlertToastProps) => {
  onMount(() => {
    Promise.resolve().then(() => props.onClose());
    toast.success(props.title);
  });
  return null;
};
