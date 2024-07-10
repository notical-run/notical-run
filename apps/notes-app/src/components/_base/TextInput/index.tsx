import { JSX } from 'solid-js';

export const TextInput = (props: JSX.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      {...props}
      class="block w-full border rounded px-2 py-1 mt-1 text-sm"
    />
  );
};
