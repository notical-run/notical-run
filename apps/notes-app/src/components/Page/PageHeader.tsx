import { Authorize } from '@/components/Auth/Session';
import { links } from '@/components/Navigation';
import { PageHeaderProps } from '@/components/Page';
import { A } from '@solidjs/router';
import { ParentProps, For } from 'solid-js';

export const PageHeader = (props: ParentProps<PageHeaderProps>) => {
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
          user="session"
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
