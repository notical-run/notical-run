import { createQuery } from '@tanstack/solid-query';
import { apiClient, responseJson } from '../../utils/api-client';
import { queryKeys } from '../keys';
import { useSessionId } from '@/components/Auth/Session';

export const useCurrentUser = () => {
  const [sessionId] = useSessionId();

  return createQuery(() => ({
    queryKey: queryKeys.me(),
    queryFn: () => apiClient.api.users.me.$get().then(responseJson),
    enabled: Boolean(sessionId()),
  }));
};
