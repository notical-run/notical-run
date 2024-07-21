import { cn } from '@/utils/classname';
import { JSX, Show, splitProps } from 'solid-js';

type SwitchInputProps = {
  label?: JSX.Element;
  error?: JSX.Element;
  hideCheckbox?: boolean;
};

export const SwitchInput = (
  _props: JSX.InputHTMLAttributes<HTMLInputElement> & SwitchInputProps,
) => {
  const [props, inputProps] = splitProps(_props, ['label', 'error', 'class', 'hideCheckbox']);

  return (
    <label class={cn('flex justify-start items-center gap-2 w-full py-1 px-1', props.class)}>
      <input
        {...inputProps}
        type="checkbox"
        class={cn('border-2 border-gray-200 size-4', 'appearance-none checked:bg-violet-800', {
          hidden: props.hideCheckbox,
        })}
      />

      <Show when={props.label}>
        <div class="text-sm text-slate-700">{props.label}</div>
      </Show>
    </label>
  );
};
