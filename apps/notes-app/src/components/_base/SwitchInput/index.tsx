import { cn } from '@/utils/classname';
import { JSX, Show, splitProps } from 'solid-js';

type SwitchInputProps = {
  label?: string;
  error?: string;
};

export const SwitchInput = (
  _props: JSX.InputHTMLAttributes<HTMLInputElement> & SwitchInputProps,
) => {
  const [props, inputProps] = splitProps(_props, ['label', 'error', 'class']);

  return (
    <label class={cn('flex justify-start items-center gap-3 w-full py-1 px-1', props.class)}>
      <input
        {...inputProps}
        type="checkbox"
        class={cn('border-2 border-gray-200 size-4', 'appearance-none checked:bg-violet-600')}
      />

      <Show when={props.label}>
        <div class="text-sm text-slate-700">{props.label}</div>
      </Show>
    </label>
  );
};
