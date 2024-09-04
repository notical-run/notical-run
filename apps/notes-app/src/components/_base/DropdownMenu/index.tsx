import { ComponentProps, ParentProps } from 'solid-js';
import { Popover } from '@/components/_base/Popover';
import { cn } from '@/utils/classname';

export const DropdownMenuRoot = (props: ParentProps<ComponentProps<typeof Popover>>) => {
  return (
    <Popover placement="bottom-end" offset={0} {...props}>
      {props.children}
    </Popover>
  );
};

export const DropdownMenuItems = (props: ParentProps<{ class?: string }>) => {
  return (
    <Popover.Content>
      <Popover.Content.Body>
        <div class={cn('text-sm flex flex-col', props.class)} role="listbox">
          {props.children}
        </div>
      </Popover.Content.Body>
    </Popover.Content>
  );
};

export const DropdownMenuItem = (props: ParentProps<ComponentProps<typeof Popover.Close>>) => {
  return (
    <Popover.Close
      role="listitem"
      {...props}
      class={cn(
        'flex flex-1 items-center justify-start gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 w-full',
        props.class,
      )}
    >
      {props.children}
    </Popover.Close>
  );
};

export const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Root: DropdownMenuRoot,
  Anchor: Popover.Anchor,
  Trigger: Popover.Trigger,
  Close: Popover.Close,
  Items: DropdownMenuItems,
  Item: DropdownMenuItem,
});
