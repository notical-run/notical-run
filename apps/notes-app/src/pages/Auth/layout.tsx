import { Page } from '@/components/Page';
import { ParentProps } from 'solid-js';

const Body = (props: ParentProps) => {
  return (
    <Page.Body>
      <Page.Body.Main class="bg-slate-800 flex items-center max-sm:items-start max-sm:pt-10">
        <div class="flex-1 mx-auto w-full max-w-sm bg-white p-8 shadow rounded max-sm:py-8 max-sm:px-5">
          {props.children}
        </div>
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
    <Page title="Signup">
      <Body>{props.children}</Body>
    </Page>
  );
};
