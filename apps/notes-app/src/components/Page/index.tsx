import { cn } from '@/utils/classname';
import { createEffect, ParentProps } from 'solid-js';
import { LayoutProvider } from '@/components/Page/layout';
import { PageHeader } from '@/components/Page/PageHeader';
import { PageSideMenu, PageSideMenuLink } from '@/components/Page/PageSideMenu';

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

export const Page = Object.assign(PageRoot, {
  Header: PageHeader,
  Body: Object.assign(PageBody, {
    Main: PageMain,
    SideMenu: PageSideMenu,
    SideMenuLink: PageSideMenuLink,
  }),
});
