import { ApiError } from '@/utils/api-client';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/solid-query';
import toast from 'solid-toast';

const NO_RETRY_STATUS = [403, 404];

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) =>
        !NO_RETRY_STATUS.includes((error as any).status) && failureCount < 3,
    },
  },
  queryCache: new QueryCache({
    // onError() {},
  }),
  mutationCache: new MutationCache({
    onError(error: Error | ApiError) {
      if (!(error as ApiError)?.handled) {
        toast.error(error?.message ?? 'Something went wrong');
      }
    },
  }),
});
