import { Page } from '@/components/Page';
import { ParentProps } from 'solid-js';

export const LayoutWorkspaces = (props: ParentProps) => {
  return (
    <Page title="My workspaces">
      <Page.Header />
      <Page.Body>
        <Page.Body.Main>
          <div class="mx-auto max-w-4xl">{props.children}</div>
        </Page.Body.Main>
      </Page.Body>
    </Page>
  );
};
