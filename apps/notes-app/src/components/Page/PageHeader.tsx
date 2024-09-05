import { Button } from '@/components/_base/Button';
import { Authorize } from '@/components/Auth/Session';
import { Link } from '@/components/Navigation';
import { A } from '@solidjs/router';
import { ParentProps, For, JSX } from 'solid-js';

export type PageHeaderProps = {
  breadcrumbs?: { content: JSX.Element }[];
};

export const PageHeader = (props: ParentProps<PageHeaderProps>) => {
  return (
    <div class="w-full px-3 py-2 md:px-6 border-b border-slate-150 shadow-sm">
      <div class="flex justify-between gap-2">
        <div class="flex items-center">
          <A href="/" class="text-xl pr-2" title="Dashboard">
            <img src="/images/logo.svg" class="size-6" alt="notical.run" />
          </A>

          <For each={props.breadcrumbs}>
            {crumb => (
              <div class="flex items-center text-xs mt-0.5">
                <div class="px-2 text-slate-300 mt-0.5">/</div>

                <span class="text-slate-600">{crumb.content}</span>
              </div>
            )}
          </For>
        </div>

        <div class="flex items-center">
          <Authorize
            user="session"
            fallback={
              <Button as={Link.Login} size="sm" variant="accent-link">
                Login
              </Button>
            }
          >
            <Button as={Link.Logout} size="sm" variant="accent-link">
              Logout
            </Button>
          </Authorize>
        </div>
      </div>
    </div>
  );
};
