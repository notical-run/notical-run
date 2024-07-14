import { ApiError } from '@/utils/api-client';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/solid-query';
import toast from 'solid-toast';

export const queryClient = new QueryClient({
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
