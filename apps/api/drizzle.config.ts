import { defineConfig } from 'drizzle-kit';

if (!process.env.POSTGRES_CONNECTION_STRING) {
  throw new Error('POSTGRES_CONNECTION_STRING is not set');
}

export default defineConfig({
  schema: './src/db/schema-compat.cjs',
  out: './db',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_CONNECTION_STRING,
  },
  verbose: true,
});
