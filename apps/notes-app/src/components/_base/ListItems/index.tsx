import { ParentProps } from 'solid-js';
import { WarnView } from '@/components/ViewStates';

export const ListRoot = (props: ParentProps) => {
  return <div class="flex flex-col gap-2">{props.children}</div>;
};

export const ListItem = (props: ParentProps) => {
  return (
    <div class="block shadow-sm rounded-md border border-slate-150 bg-white hover:bg-gray-100">
      {props.children}
    </div>
  );
};

export const List = Object.assign(ListRoot, {
  Item: ListItem,
  Empty: WarnView,
});
