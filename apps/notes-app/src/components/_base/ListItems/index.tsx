import { ParentProps } from 'solid-js';
import { EmptyView } from '@/components/ViewStates';
import { cn } from '@/utils/classname';

export const ListRoot = (
  props: ParentProps<{ grid?: boolean; class?: string; 'aria-label'?: string }>,
) => {
  return (
    <div
      role="list"
      aria-label="List"
      {...props}
      class={cn(
        {
          'flex flex-col gap-2': !props.grid,
          'grid grid-cols-2 gap-2 max-sm:grid-cols-1': props.grid,
        },
        props.class,
      )}
    />
  );
};

export const ListItem = (props: ParentProps<{ class?: string; 'aria-label'?: string }>) => {
  return (
    <div
      role="listitem"
      {...props}
      class={cn(
        'block shadow-sm rounded-md border border-slate-200 bg-white hover:bg-gray-100',
        props.class,
      )}
    />
  );
};

export const List = Object.assign(ListRoot, {
  Item: ListItem,
  Empty: EmptyView,
});
