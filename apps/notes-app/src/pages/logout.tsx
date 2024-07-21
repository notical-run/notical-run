import { useNavigate } from '@solidjs/router';
import { createEffect } from 'solid-js';
import { useLogout } from '../api/queries/auth';
import { useSessionId } from '../components/Auth/Session';

const Logout = () => {
  const [_, setSessionId] = useSessionId();
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

export default Logout;
