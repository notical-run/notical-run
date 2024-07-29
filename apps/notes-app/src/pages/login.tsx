import { useSessionId } from '../components/Auth/Session';
import { A, useNavigate } from '@solidjs/router';
import { useLogin } from '../api/queries/auth';
import { TextInput } from '../components/_base/TextInput';
import { Button } from '../components/_base/Button';
import { links } from '../components/Navigation';
import { Page } from '@/components/Page';
import { createForm, SubmitHandler, zodForm } from '@modular-forms/solid';
import { z } from 'zod';
import { Show } from 'solid-js';
import { toApiErrorMessage } from '@/utils/api-client';
import { Alert } from '@/components/_base/Alert';

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

type LoginSchemaType = z.infer<typeof LoginSchema>;

const Login = () => {
  const [_sessionId, updateSessionId] = useSessionId();
  const authenticator = useLogin();
  const navigate = useNavigate();

  const [_loginForm, { Form, Field }] = createForm<LoginSchemaType>({
    validate: zodForm(LoginSchema),
    validateOn: 'blur',
    revalidateOn: 'input',
  });

  const loginUser: SubmitHandler<LoginSchemaType> = formData => {
    authenticator.mutate(formData, {
      onSuccess: response => {
        if (!response.sessionId) return;
        updateSessionId(response.sessionId);
        navigate(links.workspaces());
      },
    });
  };

  return (
    <Page title="Login">
      <Form onSubmit={loginUser} class="block my-1 mx-auto w-full max-w-sm">
        <h1>Login</h1>

        <Field name="email">
          {(store, props) => (
            <TextInput
              {...props}
              error={store.error}
              type="email"
              placeholder="notetaker@gmail.com"
              label="Email"
            />
          )}
        </Field>

        <Field name="password">
          {(store, props) => (
            <TextInput
              {...props}
              error={store.error}
              type="password"
              placeholder="*************"
              label="Password"
            />
          )}
        </Field>

        <Button type="submit" class="block w-full mt-2" disabled={authenticator.isPending}>
          Login
        </Button>

        <Show when={authenticator.error}>
          <div class="pt-4">
            <Alert variant="danger">
              {toApiErrorMessage(authenticator.error) ?? 'Something went wrong'}
            </Alert>
          </div>
        </Show>

        <A href={links.signup()} class="block text-sm text-slate-600 mt-4 hover:text-slate-900">
          Don't have an account? Signup
        </A>
      </Form>
    </Page>
  );
};

export default Login;
