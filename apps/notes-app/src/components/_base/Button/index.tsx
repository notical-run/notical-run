import { cn } from '@/utils/classname';
import { JSX, mergeProps, splitProps } from 'solid-js';

type ButtonVariant = 'primary' | 'primary-bordered';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = (_props: ButtonProps) => {
  const [props, buttonProps] = splitProps(
    mergeProps({ variant: 'primary', size: 'md' } as Partial<ButtonProps>, _props),
    ['variant', 'size', 'class'],
  );

  return (
    <button
      {...buttonProps}
      class={cn(
        'rounded flex items-center gap-2',
        {
          'disabled:opacity-25': buttonProps.disabled,

          // sizes
          'text-xs px-2 py-1': props.size === 'sm',
          'text-sm px-3 py-1': props.size === 'md',
          'text-md px-2 py-1': props.size === 'lg',

          // variants
          'bg-slate-900 text-white hover:bg-slate-700': props.variant === 'primary',
          'border border-slate-900 text-slate-900 hover:border-slate-500 hover:text-slate-500':
            props.variant === 'primary-bordered',
        },
        props.class,
      )}
    />
  );
};
