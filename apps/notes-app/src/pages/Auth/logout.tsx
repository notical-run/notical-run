import { useNavigate } from '@solidjs/router';
import { onMount } from 'solid-js';
import { useLogout } from '@/api/queries/auth';
import { useSessionId } from '@/components/Auth/Session';
import { queryClient } from '@/api/query-client';

const Logout = () => {
  const [_, setSessionId] = useSessionId();
  const logoutRequest = useLogout();
  const navigate = useNavigate();

  onMount(() => {
    logoutRequest.mutate();
    queryClient.clear();
    setSessionId('');
    navigate('/login');
  });

  return null;
};

export default Logout;
