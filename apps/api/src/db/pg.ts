import postgres from 'postgres';

const { POSTGRES_CONNECTION_STRING } = import.meta.env;

if (!POSTGRES_CONNECTION_STRING) {
  throw new Error('Missing POSTGRES_CONNECTION_STRING');
}

export const queryClient = postgres(POSTGRES_CONNECTION_STRING, { max: 10, idle_timeout: 20_000 });
