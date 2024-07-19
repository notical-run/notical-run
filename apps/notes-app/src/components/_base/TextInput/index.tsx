import { JSX, Show, splitProps } from 'solid-js';

type TextInputProps = {
  label?: string;
};

export const TextInput = (_props: JSX.InputHTMLAttributes<HTMLInputElement> & TextInputProps) => {
  const [props, inputProps] = splitProps(_props, ['label']);

  return (
    <label class="block mt-2">
      <Show when={props.label}>
        <div class="text-xs text-slate-700">{props.label}:</div>
      </Show>
      <input {...inputProps} class="block w-full border rounded px-2 py-1  text-sm" />
    </label>
  );
};
