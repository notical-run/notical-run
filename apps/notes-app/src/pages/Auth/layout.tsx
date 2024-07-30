import { Page } from '@/components/Page';
import { ParentProps } from 'solid-js';

const Body = (props: ParentProps) => {
  return (
    <Page.Body>
      <Page.Body.Main>
        <div class="flex-1 py-2 mx-auto w-full max-w-sm">{props.children}</div>
      </Page.Body.Main>
    </Page.Body>
  );
};

export const LayoutLogin = (props: ParentProps) => {
  return (
    <Page title="Login">
      <Body>{props.children}</Body>
    </Page>
  );
};

export const LayoutSignup = (props: ParentProps) => {
  return (
    <Page title="Login">
      <Body>{props.children}</Body>
    </Page>
  );
};
