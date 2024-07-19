import { ParentProps } from 'solid-js';
import { AiOutlineExclamationCircle } from 'solid-icons/ai';

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

export const ListEmpty = (props: ParentProps<{ title?: string; subtitle?: string }>) => {
  return (
    <div class="text-center py-8 text-slate-600 flex flex-col items-center gap-4">
      <AiOutlineExclamationCircle size={35} />
      <div>
        <h1 class="font-semibold text-lg">{props.title}</h1>
        <div class="text-xs pt-2">{props.subtitle}</div>
        {props.children}
      </div>
    </div>
  );
};

export const List = Object.assign(ListRoot, {
  Item: ListItem,
  Empty: ListEmpty,
});
