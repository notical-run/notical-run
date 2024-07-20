import { createSessionId } from '../components/Auth/Session';
import { A, useNavigate } from '@solidjs/router';
import { useSignup } from '../api/queries/auth';
import { TextInput } from '../components/_base/TextInput';
import { Button } from '../components/_base/Button';
import { links } from '../components/Navigation';
import { Page } from '@/components/Page';
import { createForm, SubmitHandler, zodForm } from '@modular-forms/solid';
import { z } from 'zod';
import { Show } from 'solid-js';
import { toApiErrorMessage } from '@/utils/api-client';

const signupSchema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

type SignupSchemaType = z.infer<typeof signupSchema>;

const Signup = () => {
  const [_sessionId, updateSessionId] = createSessionId();
  const signupMutation = useSignup();
  const navigate = useNavigate();

  const [_signupForm, { Form, Field }] = createForm<SignupSchemaType>({
    validate: zodForm(signupSchema),
    validateOn: 'blur',
    revalidateOn: 'input',
  });

  const signupUser: SubmitHandler<SignupSchemaType> = formData => {
    signupMutation.mutate(formData, {
      onSuccess: response => {
        if (!response.sessionId) return;
        updateSessionId(response.sessionId);
        navigate(links.workspaces());
      },
    });
  };

  return (
    <Page title="Signup">
      <Form onSubmit={signupUser} class="block my-1 mx-auto w-full max-w-sm">
        <h1>Signup</h1>

        <Field name="name">
          {(store, props) => (
            <TextInput
              {...props}
              error={store.error}
              type="text"
              placeholder="Eg: Note Taker"
              label="Name"
            />
          )}
        </Field>

        <Field name="email">
          {(store, props) => (
            <TextInput
              {...props}
              error={store.error}
              type="email"
              placeholder="Eg: notetaker@gmail.com"
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

        <Show when={signupMutation.error}>
          <div class="text-xs text-right text-red-700 mt-2">
            {toApiErrorMessage(signupMutation.error)}
          </div>
        </Show>

        <Button type="submit" class="block w-full mt-2" disabled={signupMutation.isPending}>
          Signup
        </Button>

        <A href={links.login()} class="block text-sm text-slate-600 mt-4 hover:text-slate-900">
          Already have an account? Login
        </A>
      </Form>
    </Page>
  );
};

export default Signup;
