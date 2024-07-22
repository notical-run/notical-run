import { cn } from '@/utils/classname';
import { AiOutlineExclamationCircle } from 'solid-icons/ai';
import { Match, mergeProps, ParentProps, Switch } from 'solid-js';

type AlertProps = { variant?: 'primary' | 'warning' | 'danger'; class?: string };

export const Alert = (_props: ParentProps<AlertProps>) => {
  const props = mergeProps({ variant: 'primary' }, _props);
  return (
    <div
      class={cn(
        'border px-3 py-1 text-sm rounded flex justify-start items-center gap-2',
        {
          'border-yellow-700 bg-yellow-100 text-yellow-900': props.variant === 'warning',
          'border-slate-700 bg-slate-100 text-slate-900': props.variant === 'primary',
          'border-red-700 bg-red-100 text-red-900': props.variant === 'danger',
        },
        props.class,
      )}
    >
      <Switch>
        <Match when={props.variant === 'warning'}>
          <AiOutlineExclamationCircle />
        </Match>
        <Match when={props.variant === 'danger'}>
          <AiOutlineExclamationCircle />
        </Match>
        <Match when={props.variant === 'primary'}>
          <AiOutlineExclamationCircle />
        </Match>
      </Switch>
      {props.children}
    </div>
  );
};
