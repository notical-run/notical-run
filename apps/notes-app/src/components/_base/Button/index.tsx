import { JSX, mergeProps } from 'solid-js';

type ButtonVariant = 'primary' | 'primary-bordered';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = (_props: ButtonProps) => {
  const props = mergeProps({ variant: 'primary', size: 'md' } as Partial<ButtonProps>, _props);

  return (
    <button
      {...props}
      classList={{
        rounded: true,

        // sizes
        'text-xs px-2 py-1': props.size === 'sm',
        'text-sm px-2 py-1': props.size === 'md',
        'text-md px-2 py-1': props.size === 'lg',

        // variants
        'bg-slate-900 text-white hover:bg-slate-700': props.variant === 'primary',
        'border border-slate-900 text-slate-900': props.variant === 'primary-bordered',
      }}
    />
  );
};
