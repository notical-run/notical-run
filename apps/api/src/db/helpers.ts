import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as path from 'node:path';

export const runMigration = async () => {
  const queryClient = postgres(import.meta.env.POSTGRES_CONNECTION_STRING!, {
    max: 1,
  });
  await migrate(drizzle(queryClient), { migrationsFolder: path.join(__dirname, '../../db') });
  await queryClient.end();
};

const withParts = (connectionString: string): [string, string] => {
  const connectionParts = connectionString?.split('/');
  const dbName = connectionParts.pop();
  return [dbName!, connectionParts.join('/')];
};

export const recreateDB = async () => {
  const [dbName, connectionStr] = withParts(import.meta.env.POSTGRES_CONNECTION_STRING!);

  const queryClient = postgres(connectionStr, { max: 1 });
  const db = drizzle(queryClient);
  // Force disconnect all connections to the database
  await db.execute(
    sql.raw(
      `SELECT pg_terminate_backend(pg_stat_activity.pid)
       FROM pg_stat_activity
       WHERE pg_stat_activity.datname = '${dbName}'
       AND pid <> pg_backend_pid();`,
    ),
  );
  // Reset db
  await db.execute(sql.raw(`DROP DATABASE IF EXISTS "${dbName}";`));
  await db.execute(sql.raw(`CREATE DATABASE "${dbName}";`));
  await queryClient.end();
};
