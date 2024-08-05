import { Tooltip } from '@/components/_base/Tooltip';
import { useLayoutContext } from '@/components/Page/layout';
import { cn } from '@/utils/classname';
import { A } from '@solidjs/router';
import { AiOutlineMenu } from 'solid-icons/ai';
import { FaSolidAngleLeft } from 'solid-icons/fa';
import { JSX, ComponentProps, ParentProps, splitProps, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';

type PageSideMenuLinkCommonProps = { icon: JSX.Element };
type PageSideMenuLinkAnchorProps = { href: string } & ComponentProps<typeof A>;
type PageSideMenuLinkButtonProps = {
  href?: undefined;
  onClick: () => void;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export const PageSideMenuLink = (
  props_: ParentProps<
    PageSideMenuLinkCommonProps & (PageSideMenuLinkAnchorProps | PageSideMenuLinkButtonProps)
  >,
) => {
  const [props, linkProps] = splitProps(props_, ['icon', 'children']);
  const { sidebarOpen } = useLayoutContext();

  return (
    <Tooltip placement="right">
      <Tooltip.Trigger as="div" class="w-full">
        <Dynamic
          component={linkProps.href ? A : p => <button {...p} />}
          {...(linkProps as any)}
          class={cn(
            'flex items-center justify-center gap-2 w-full px-2 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50',
            { 'px-3 justify-start': sidebarOpen() },
            linkProps.class,
          )}
        >
          {props.icon}
          <Show when={sidebarOpen()}>{props.children}</Show>
        </Dynamic>
      </Tooltip.Trigger>

      <Show when={!sidebarOpen()}>
        <Tooltip.Content class="mt-0 ml-2">{props.children}</Tooltip.Content>
      </Show>
    </Tooltip>
  );
};

export const PageSideMenu = (props: ParentProps) => {
  const { sidebarOpen, isFixedSidebar, toggleSidebar } = useLayoutContext();

  return (
    <div class="relative h-full">
      <div
        class={cn('w-52 h-full shadow border-r border-r-slate-150 bg-white', {
          'w-10': !isFixedSidebar(),
          'w-52': sidebarOpen(),
        })}
      >
        <Show when={!isFixedSidebar()}>
          <button
            onClick={toggleSidebar}
            class="w-full py-3 flex items-center justify-center border-b text-sm hover:bg-slate-100"
          >
            {sidebarOpen() ? <FaSolidAngleLeft /> : <AiOutlineMenu />}
          </button>
        </Show>

        <div class="text-xs">{props.children}</div>
      </div>
    </div>
  );
};
