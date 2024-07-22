import { IfAuthenticated } from '@/components/Auth/Session';
import { links } from '@/components/Navigation';
import { A } from '@solidjs/router';
import { createEffect, For, JSX, ParentProps, Suspense } from 'solid-js';

const PageRoot = (props: ParentProps & { title?: string }) => {
  createEffect(() => {
    if (props.title) document.title = `${props.title} - notical.run`;
    else document.title = `notical.run`;
  });

  return <div class="flex flex-col h-screen overflow-hidden">{props.children}</div>;
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
        <IfAuthenticated
          fallback={
            <A href={links.login()} class="text-xs text-violet-600">
              Login
            </A>
          }
        >
          <A href={links.logout()} class="text-xs text-violet-600">
            Logout
          </A>
        </IfAuthenticated>
      </div>
    </div>
  );
};

const PageBody = (props: ParentProps) => (
  <div class="flex flex-row justify-stretch flex-1 overflow-hidden">{props.children}</div>
);

const PageMain = (props: ParentProps) => {
  return (
    <main class="p-4 flex-1 overflow-y-auto">
      <Suspense fallback={<div>Loading...</div>}>{props.children}</Suspense>
    </main>
  );
};

const PageSideMenu = (props: ParentProps) => {
  return (
    <div class="w-52 shadow border-r border-r-slate-150">
      <div class="px-2 py-3">{props.children}</div>
    </div>
  );
};

export const Page = Object.assign(PageRoot, {
  Header: PageHeader,
  Body: Object.assign(PageBody, {
    Main: PageMain,
    SideMenu: PageSideMenu,
  }),
});
