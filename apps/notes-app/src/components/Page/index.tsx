import { A } from '@solidjs/router';
import { For, JSX, ParentProps, Show } from 'solid-js';

export type PageProps = {
  breadcrumbs?: { href?: string; text: JSX.Element }[];
};

export const Page = ({ children, breadcrumbs }: ParentProps<PageProps>) => {
  return (
    <div>
      <div class="flex justify-between gap-2 px-4 py-2 border-b">
        <div class="flex items-center">
          <A href="/" class="text-xl">
            notical.run
          </A>
          <For each={breadcrumbs}>
            {(b, i) => (
              <div class="flex text-xs mt-1">
                <Show when={i() < (breadcrumbs ?? [])?.length}>
                  <div class="px-2 text-slate-300">/</div>
                </Show>

                <Show when={!!b.href} fallback={<span class="text-slate-600">{b.text}</span>}>
                  <A href={b.href!} class="text-slate-950">
                    {b.text}
                  </A>
                </Show>
              </div>
            )}
          </For>
        </div>

        <div class="flex items-center">
          <A href="/logout" class="text-xs text-violet-600">
            Logout
          </A>
        </div>
      </div>

      <div class="p-4">{children}</div>
    </div>
  );
};
