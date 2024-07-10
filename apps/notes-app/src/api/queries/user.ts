import { createQuery } from '@tanstack/solid-query';
import { apiClient, responseJson } from '../../utils/api-client';
import { queryKeys } from '../keys';

export const useCurrentUser = () => {
  return createQuery(() => ({
    queryKey: queryKeys.me(),
    queryFn: () => apiClient.api.users.me.$get().then(responseJson),
  }));
};
