import { createSessionId } from '../components/Auth/Session';
import { A, useNavigate } from '@solidjs/router';
import { useSignup } from '../api/queries/auth';
import { TextInput } from '../components/_base/TextInput';
import { Button } from '../components/_base/Button';
import { links } from '../components/Navigation';

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
    <div>
      <h1>Signup</h1>
      <form onSubmit={signupUser} class="block my-1 mx-auto max-w-xs">
        <input />
        <TextInput type="text" name="name" placeholder="Name" />
        <TextInput type="email" name="email" placeholder="Email" />
        <TextInput type="password" name="password" placeholder="Password" />
        <Button type="submit" class="block w-full mt-2">
          Signup
        </Button>
        <A href={links.login()}>Already have an account? Login</A>
      </form>
    </div>
  );
};
