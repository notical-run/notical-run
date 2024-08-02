import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import { queryClient } from './pg';

const { POSTGRES_CONNECTION_STRING } = import.meta.env;

if (!POSTGRES_CONNECTION_STRING) {
  throw new Error('Missing POSTGRES_CONNECTION_STRING');
}

const enableLogger = import.meta.env.NODE_ENV === 'development';

export const db = drizzle(queryClient, { schema, logger: enableLogger });
