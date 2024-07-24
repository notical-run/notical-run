import { cn } from '@/utils/classname';
import CorvuTooltip from '@corvu/tooltip';
import { ComponentProps, ParentProps } from 'solid-js';

type TooltipRootProps = ComponentProps<typeof CorvuTooltip>;

const TooltipRoot = (props: ParentProps<TooltipRootProps>) => {
  return <CorvuTooltip openDelay={200} closeDelay={100} hoverableContent {...props} />;
};

type TooltipContentProps = ComponentProps<typeof CorvuTooltip.Content>;

const TooltipContent = (props: ParentProps<TooltipContentProps>) => {
  return (
    <CorvuTooltip.Portal>
      <CorvuTooltip.Content
        {...props}
        class={cn(
          'rounded-sm text-xs shadow-md bg-slate-100 text-slate-700 px-2 py-1 border border-slate-200 mt-1 z-50 max-w-96',
          props.class,
        )}
      >
        <CorvuTooltip.Arrow class="text-slate-200" size={10} />
        {props.children}
      </CorvuTooltip.Content>
    </CorvuTooltip.Portal>
  );
};

export const Tooltip = Object.assign(TooltipRoot, {
  Root: TooltipRoot,
  Content: TooltipContent,
  Trigger: CorvuTooltip.Trigger,
  Anchor: CorvuTooltip.Anchor,
});
