import { Authorize } from '@/components/Auth/Session';
import { links } from '@/components/Navigation';
import { cn } from '@/utils/classname';
import { A } from '@solidjs/router';
import { createEffect, For, JSX, ParentProps, Show } from 'solid-js';
import { AiOutlineArrowLeft, AiOutlineMenu } from 'solid-icons/ai';
import { LayoutProvider, useLayoutContext } from '@/components/Page/layout';
import { Tooltip } from '@/components/_base/Tooltip';
import { Dynamic } from 'solid-js/web';

const PageRoot = (props: ParentProps & { title?: string }) => {
  createEffect(() => {
    if (props.title) document.title = `${props.title} - notical.run`;
    else document.title = `notical.run`;
  });

  return (
    <LayoutProvider>
      <div class="flex flex-col h-screen overflow-hidden">{props.children}</div>
    </LayoutProvider>
  );
};

export type PageHeaderProps = {
  breadcrumbs?: { content: JSX.Element }[];
};

const PageHeader = (props: ParentProps<PageHeaderProps>) => {
  return (
    <div class="flex justify-between gap-2 px-4 py-2 border-b border-b-slate-150 shadow-sm">
      <div class="flex items-center">
        <A href="/" class="text-xl pr-2" title="Dashboard">
          <img src="/images/logo.png" class="size-6" alt="notical.run" />
        </A>

        <For each={props.breadcrumbs}>
          {crumb => (
            <div class="flex items-center text-xs mt-1">
              <div class="px-2 text-slate-300">/</div>

              <span class="text-slate-600">{crumb.content}</span>
            </div>
          )}
        </For>
      </div>

      <div class="flex items-center">
        <Authorize
          user="logged_in"
          fallback={
            <A href={links.login()} class="text-xs text-violet-600">
              Login
            </A>
          }
        >
          <A href={links.logout()} class="text-xs text-violet-600">
            Logout
          </A>
        </Authorize>
      </div>
    </div>
  );
};

const PageBody = (props: ParentProps) => (
  <div class="flex flex-row justify-stretch flex-1 overflow-hidden">{props.children}</div>
);

const PageMain = (props: ParentProps<{ class?: string }>) => {
  return (
    <main class={cn('p-4 flex-1 overflow-y-auto animate-fade-in', props.class)}>
      {props.children}
    </main>
  );
};

const PageSideMenuLink = (
  props: ParentProps<{ icon: JSX.Element; href?: string; onClick?: () => void; class?: string }>,
) => {
  const { sidebarOpen } = useLayoutContext();

  return (
    <Tooltip placement="right">
      <Tooltip.Trigger as="div" class="w-full">
        <Dynamic
          component={props.href ? A : p => <button {...p} />}
          href={props.href!}
          onClick={props.onClick}
          class={cn(
            'flex items-center justify-center gap-2 w-full px-2 py-3 text-slate-600 hover:text-slate-400',
            { 'px-3 justify-start': sidebarOpen() },
            props.class,
          )}
        >
          {props.icon}
          <Show when={sidebarOpen()}>{props.children}</Show>
        </Dynamic>
      </Tooltip.Trigger>

      <Tooltip.Content class={cn('mt-0 ml-2', { hidden: sidebarOpen() })}>
        {props.children}
      </Tooltip.Content>
    </Tooltip>
  );
};

const PageSideMenu = (props: ParentProps) => {
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
            {sidebarOpen() ? <AiOutlineArrowLeft /> : <AiOutlineMenu />}
          </button>
        </Show>

        <div class="text-xs">{props.children}</div>
      </div>
    </div>
  );
};

export const Page = Object.assign(PageRoot, {
  Header: PageHeader,
  Body: Object.assign(PageBody, {
    Main: PageMain,
    SideMenu: PageSideMenu,
    SideMenuLink: PageSideMenuLink,
  }),
});
