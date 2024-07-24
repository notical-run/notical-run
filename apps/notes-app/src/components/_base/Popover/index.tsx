import CorvuPopover from '@corvu/popover';
import { ParentProps } from 'solid-js';
import { Placement } from '@floating-ui/utils';

export const PopoverRoot = (props: ParentProps<{ placement?: Placement; offset?: number }>) => {
  return (
    <CorvuPopover placement={props.placement} floatingOptions={{ offset: props.offset ?? 10 }}>
      {props.children}
    </CorvuPopover>
  );
};

export const PopoverContent = (props: ParentProps) => {
  return (
    <CorvuPopover.Portal>
      <CorvuPopover.Overlay />
      <CorvuPopover.Content class="border border-slate-200 bg-white shadow-xl rounded-md animate-fade-in">
        <CorvuPopover.Arrow size={14} class="text-slate-200" />
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
