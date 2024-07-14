import { QueryClientProvider } from '@tanstack/solid-query';
import { Toaster } from 'solid-toast';
import { Routes } from './Routes';
import { queryClient } from './api/query-client';

export const App = () => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Routes />
      </QueryClientProvider>
      <Toaster
        position="bottom-right"
        gutter={4}
        toastOptions={{
          className: '!bg-slate-900 !text-white border-2 border-slate-700 !py-1 !px-2 !text-xs',
          duration: 5000,
        }}
      />
    </>
  );
};
