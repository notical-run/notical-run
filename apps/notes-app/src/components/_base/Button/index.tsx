import { cn } from '@/utils/classname';
import { ComponentProps, JSX, mergeProps, splitProps, ValidComponent } from 'solid-js';
import { Dynamic } from 'solid-js/web';

type ButtonVariant = 'primary' | 'primary-bordered' | 'plain' | 'accent' | 'accent-link';
type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = <As extends ValidComponent>(
  _props: ButtonProps & { as?: As } & ComponentProps<As>,
) => {
  const [props, buttonProps] = splitProps(
    mergeProps({ variant: 'primary', size: 'md', as: 'button' } as Partial<ButtonProps>, _props),
    ['variant', 'size', 'class', 'as'],
  );

  return (
    <Dynamic
      component={props.as}
      role="button"
      {...(buttonProps as any)}
      class={cn(
        'rounded flex items-center justify-center gap-2',
        {
          'disabled:opacity-25': buttonProps.disabled,

          // sizes
          'text-xs px-2 py-1': props.size === 'sm',
          'text-sm px-3 py-1': props.size === 'md',
          'text-md px-3 py-1': props.size === 'lg',

          // variants
          'bg-slate-900 text-white hover:bg-slate-700': props.variant === 'primary',
          'border border-slate-900 text-slate-900 hover:border-slate-500 hover:text-slate-500':
            props.variant === 'primary-bordered',
          'rounded-none': props.variant === 'plain',
          'bg-violet-700 text-white hover:bg-violet-500': props.variant === 'accent',
          'text-violet-700 hover:text-violet-500': props.variant === 'accent-link',
        },
        props.class,
      )}
    />
  );
};
