import { A } from '@solidjs/router';
import { For, JSX, ParentProps, Show } from 'solid-js';

export type PageProps = {
  breadcrumbs?: { href?: string; text: JSX.Element }[];
};

export const Page = ({ children, breadcrumbs }: ParentProps<PageProps>) => {
  return (
    <div class="flex flex-col h-screen">
      <div class="flex-1 flex flex-col">
        <div class="flex-1 overflow-y-auto">
          <div class="flex items-center justify-between px-4 py-2 border-b">
            <div class="flex items-center">
              <div class="flex items-center">
                <A href="/" class="text-xl">
                  notical.run
                </A>
                <For each={breadcrumbs}>
                  {(b, i) => (
                    <div class="flex items-center text-xs mt-1">
                      <Show when={i() < (breadcrumbs ?? [])?.length}>
                        <div class="px-2 text-slate-300">/</div>
                      </Show>

                      <Show
                        when={!!b.href}
                        fallback={<span class="text-slate-600">{b.text}</span>}
                      >
                        <A href={b.href!} class="text-slate-950">
                          {b.text}
                        </A>
                      </Show>
                    </div>
                  )}
                </For>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-sm">
                <A href="/logout" class="text-violet-600">
                  Logout
                </A>
              </div>
            </div>
          </div>
          <div class="flex-1 p-4">{children}</div>
        </div>
      </div>
    </div>
  );
};
