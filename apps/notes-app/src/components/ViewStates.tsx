import { FaSolidTriangleExclamation } from 'solid-icons/fa';
import { JSX, ParentProps } from 'solid-js';
import { ImSpinner2 } from 'solid-icons/im';
import { AiOutlineExclamationCircle } from 'solid-icons/ai';
import { ImFileEmpty } from 'solid-icons/im';

type ViewContentProps = {
  title?: JSX.Element;
  subtitle?: JSX.Element;
};

export const ErrorView = (props: ParentProps<ViewContentProps>) => {
  return (
    <div class="text-center py-8 flex flex-col items-center gap-4 text-slate-500">
      <FaSolidTriangleExclamation size={35} class="text-red-400" />
      <div>
        {props.title && <h1 class="font-semibold text-lg">{props.title}</h1>}
        {props.subtitle && <div class="text-xs pt-2">{props.subtitle}</div>}
        {props.children}
      </div>
    </div>
  );
};

export const LoadingView = (props: ParentProps<ViewContentProps>) => {
  return (
    <div class="text-center pt-20 flex flex-col items-center justify-center gap-4 text-slate-500">
      <ImSpinner2 size={40} class="text-slate-400 animate-spin" />
      <div>
        {props.title && <h1 class="font-semibold text-lg">{props.title}</h1>}
        {props.subtitle && <div class="text-xs pt-2">{props.subtitle}</div>}
        {props.children}
      </div>
    </div>
  );
};

export const WarnView = (props: ParentProps<ViewContentProps>) => {
  return (
    <div class="text-center py-8 text-slate-600 flex flex-col items-center gap-4">
      <AiOutlineExclamationCircle size={35} class="text-yellow-700" />
      <div>
        {props.title && <h1 class="font-semibold text-lg">{props.title}</h1>}
        {props.subtitle && <div class="text-xs pt-2">{props.subtitle}</div>}
        {props.children}
      </div>
    </div>
  );
};

export const EmptyView = (props: ParentProps<ViewContentProps>) => {
  return (
    <div class="text-center py-8 text-slate-600 flex flex-col items-center gap-4">
      <ImFileEmpty size={35} />
      <div>
        {props.title && <h1 class="font-semibold text-lg">{props.title}</h1>}
        {props.subtitle && <div class="text-xs pt-2">{props.subtitle}</div>}
        {props.children}
      </div>
    </div>
  );
};
