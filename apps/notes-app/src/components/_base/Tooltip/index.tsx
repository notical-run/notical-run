import CorvuTooltip from '@corvu/tooltip';
import { ParentProps } from 'solid-js';

const TooltipRoot = (props: ParentProps) => {
  return (
    <CorvuTooltip openDelay={200} closeDelay={100} hoverableContent>
      {props.children}
    </CorvuTooltip>
  );
};

const TooltipContent = (props: ParentProps) => {
  return (
    <CorvuTooltip.Portal>
      <CorvuTooltip.Content class="rounded-sm text-xs shadow-md bg-slate-100 text-slate-700 px-2 py-1 border border-slate-200 mt-1 z-50 max-w-96">
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
