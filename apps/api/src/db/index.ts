import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const { POSTGRES_CONNECTION_STRING } = import.meta.env;

if (!POSTGRES_CONNECTION_STRING) {
  throw new Error('Missing POSTGRES_CONNECTION_STRING');
}

export const queryClient = postgres(POSTGRES_CONNECTION_STRING);

export const db = drizzle(queryClient, { schema });
