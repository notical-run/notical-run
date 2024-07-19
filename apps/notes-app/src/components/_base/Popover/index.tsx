import CorvuPopover from '@corvu/popover';
import { ParentProps } from 'solid-js';

export const PopoverRoot = (props: ParentProps) => {
  return <CorvuPopover floatingOptions={{ offset: 12 }}>{props.children}</CorvuPopover>;
};

export const PopoverContent = (props: ParentProps) => {
  return (
    <CorvuPopover.Portal>
      <CorvuPopover.Overlay />
      <CorvuPopover.Content class="border-t-2 border-t-slate-900 bg-white shadow-xl rounded-md">
        <CorvuPopover.Arrow size={12} class="text-slate-900" />
        <div class="border-b border-x border-slate-100">{props.children}</div>
      </CorvuPopover.Content>
    </CorvuPopover.Portal>
  );
};

export const Popover = Object.assign(PopoverRoot, {
  Root: PopoverRoot,
  Anchor: CorvuPopover.Anchor,
  Trigger: CorvuPopover.Trigger,
  Close: CorvuPopover.Close,
  Content: Object.assign(PopoverContent, {
    Heading: CorvuPopover.Label,
    Body: CorvuPopover.Description,
  }),
});
