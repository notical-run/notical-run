import clsx from 'clsx';
import { JSX } from 'solid-js';

export const Button = (props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      class={clsx('bg-slate-900 text-white rounded px-2 py-1', props.class)}
    />
  );
};
