import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

if (!import.meta.env.POSTGRES_CONNECTION_STRING) {
  throw new Error('Missing POSTGRES_CONNECTION_STRING');
}

export const queryClient = postgres(import.meta.env.POSTGRES_CONNECTION_STRING);

export const db = drizzle(queryClient);
