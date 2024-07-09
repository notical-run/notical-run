import { QueryClientProvider } from '@tanstack/solid-query';
import { Routes } from './Routes';
import { queryClient } from './api/query-client';

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes />
    </QueryClientProvider>
  );
};
