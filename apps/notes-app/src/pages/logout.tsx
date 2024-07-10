import { Navigate } from '@solidjs/router';
import { createEffect } from 'solid-js';
import { useLogout } from '../api/queries/auth';
import { createSessionId } from '../components/Auth/Session';
import { links } from '../components/Navigation';

export const Logout = () => {
  const [_, setSessionId] = createSessionId();
  const logoutRequest = useLogout();

  createEffect(() => {
    logoutRequest.mutate(undefined, {
      onSuccess() {
        setSessionId('');
      },
      onError() {
        setSessionId('');
      },
    });
  });

  return <Navigate href={links.login()} />;
};
