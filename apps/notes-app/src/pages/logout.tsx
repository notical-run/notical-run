import { useNavigate } from '@solidjs/router';
import { createEffect } from 'solid-js';
import { useLogout } from '../api/queries/auth';
import { createSessionId } from '../components/Auth/Session';

export const Logout = () => {
  const [_, setSessionId] = createSessionId();
  const logoutRequest = useLogout();
  const navigate = useNavigate();

  createEffect(() => {
    logoutRequest.mutate(undefined, {
      onSuccess() {
        setSessionId('');
        navigate('/login');
      },
      onError() {
        setSessionId('');
        navigate('/login');
      },
    });
  });

  return <div>Logging out...</div>;
};
