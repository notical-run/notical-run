import { createSessionId } from '../components/Auth/Session';
import { A, useNavigate } from '@solidjs/router';
import { useLogin } from '../api/queries/auth';
import { TextInput } from '../components/_base/TextInput';
import { Button } from '../components/_base/Button';
import { links } from '../components/Navigation';
import { Page } from '@/components/Page';

export const Login = () => {
  const [_, updateSessionId] = createSessionId();
  const loginRequest = useLogin();
  const navigate = useNavigate();

  const loginUser = (event: Event) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    loginRequest.mutate(
      {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      },
      {
        onSuccess: response => {
          if (!response.sessionId) return;
          updateSessionId(response.sessionId);
          navigate(links.workspaces());
        },
      },
    );
  };

  return (
    <Page title="Login">
      <form onSubmit={loginUser} class="block my-1 mx-auto w-full max-w-sm">
        <h1>Login</h1>

        <TextInput type="email" name="email" placeholder="Eg: notetaker@gmail.com" label="Email" />
        <TextInput type="password" name="password" placeholder="*************" label="Password" />
        <Button type="submit" class="block w-full mt-2">
          Login
        </Button>

        <A href={links.signup()} class="block text-sm text-slate-600 pt-2 hover:text-slate-900">
          Don't have an account? Signup
        </A>
      </form>
    </Page>
  );
};
