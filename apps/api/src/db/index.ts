import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema-compat.cjs';
import * as schemaOriginal from './schema';

if (!import.meta.env.POSTGRES_CONNECTION_STRING) {
  throw new Error('Missing POSTGRES_CONNECTION_STRING');
}

export const queryClient = postgres(import.meta.env.POSTGRES_CONNECTION_STRING);

export const db = drizzle(queryClient, {
  schema: schema as typeof schemaOriginal,
});
