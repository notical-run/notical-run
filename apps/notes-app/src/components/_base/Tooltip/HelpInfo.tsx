import { Tooltip } from '@/components/_base/Tooltip';
import { ParentProps } from 'solid-js';
import { FiHelpCircle } from 'solid-icons/fi';

export const HelpInfo = (props: ParentProps) => {
  return (
    <Tooltip>
      <Tooltip.Trigger>
        <FiHelpCircle size={14} />
      </Tooltip.Trigger>
      <Tooltip.Content>{props.children}</Tooltip.Content>
    </Tooltip>
  );
};
