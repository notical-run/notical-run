import { createSessionId } from '../components/Auth/Session';
import { A, useNavigate } from '@solidjs/router';
import { useSignup } from '../api/queries/auth';
import { TextInput } from '../components/_base/TextInput';
import { Button } from '../components/_base/Button';
import { links } from '../components/Navigation';
import { Page } from '@/components/Page';

export const Signup = () => {
  const [_, updateSessionId] = createSessionId();
  const signupRequest = useSignup();
  const navigate = useNavigate();

  const signupUser = (event: Event) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    signupRequest.mutate(
      {
        name: formData.get('name') as string,
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
    <Page title="Signup">
      <form onSubmit={signupUser} class="block my-1 mx-auto w-full max-w-sm">
        <h1>Signup</h1>

        <TextInput type="text" name="name" placeholder="Eg: Note Taker" label="Name" />
        <TextInput type="email" name="email" placeholder="Eg: notetaker@gmail.com" label="Email" />
        <TextInput type="password" name="password" placeholder="*************" label="Password" />
        <Button type="submit" class="block w-full mt-2">
          Signup
        </Button>

        <A href={links.login()} class="block text-sm text-slate-600 pt-2 hover:text-slate-900">
          Already have an account? Login
        </A>
      </form>
    </Page>
  );
};
