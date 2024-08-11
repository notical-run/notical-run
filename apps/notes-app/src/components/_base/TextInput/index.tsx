import { cn } from '@/utils/classname';
import { JSX, Show, splitProps } from 'solid-js';

type TextInputProps = {
  label?: JSX.Element;
  error?: JSX.Element;
};

export const TextInput = (_props: JSX.InputHTMLAttributes<HTMLInputElement> & TextInputProps) => {
  const [props, inputProps] = splitProps(_props, ['label', 'error']);

  return (
    <label class="block mt-2">
      <Show when={props.label}>
        <div class="text-xs text-slate-700">{props.label}</div>
      </Show>
      <input
        {...inputProps}
        class={cn('block w-full border border-gray-100 rounded px-2 py-1 text-sm', {
          'border-red-400 outline-red-400': !!props.error,
        })}
      />
      <Show when={props.error}>
        <div role="alert" class="text-xs text-red-700">
          {props.error}
        </div>
      </Show>
    </label>
  );
};
