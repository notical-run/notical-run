import { ParentProps } from 'solid-js';
import CorvuDialog from '@corvu/dialog';

export type DialogRootProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialFocusEl?: HTMLElement;
};

export const DialogRoot = (props: ParentProps<DialogRootProps>) => {
  return (
    <CorvuDialog {...props} closeOnEscapeKeyDown>
      {props.children}
    </CorvuDialog>
  );
};

export const DialogContent = (props: ParentProps<{ class?: string }>) => {
  return (
    <CorvuDialog.Portal>
      <CorvuDialog.Overlay class="fixed inset-0 z-50 bg-black/50" />
      <CorvuDialog.Content
        classList={{
          'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2': true,
          'w-full max-w-[500px] px-6 py-5': true,
          'rounded-lg border-2 border-slate-100 bg-white shadow-xl': true,
          [`${props.class}`]: !!props.class,
        }}
      >
        {/* <CorvuDialog.Close class="absolute top-2 right-5">x</CorvuDialog.Close> */}
        {props.children}
      </CorvuDialog.Content>
    </CorvuDialog.Portal>
  );
};

export const DialogContentHeading = (props: ParentProps) => {
  return <CorvuDialog.Label class="text-lg font-bold">{props.children}</CorvuDialog.Label>;
};

export const DialogContentFooter = (props: ParentProps) => {
  return <div class="flex justify-end gap-2 pt-6">{props.children}</div>;
};

export const Dialog = Object.assign(DialogRoot, {
  Root: DialogRoot,
  Close: CorvuDialog.Close,
  Trigger: CorvuDialog.Trigger,
  Content: Object.assign(DialogContent, {
    Heading: DialogContentHeading,
    Body: CorvuDialog.Description,
    Footer: DialogContentFooter,
  }),
});
