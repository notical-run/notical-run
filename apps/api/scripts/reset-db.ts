import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

if (!import.meta.env.POSTGRES_CONNECTION_STRING) {
  throw new Error('Missing POSTGRES_CONNECTION_STRING');
}

const runMigration = async () => {
  const queryClient = postgres(import.meta.env.POSTGRES_CONNECTION_STRING!, {
    max: 1,
  });
  await migrate(drizzle(queryClient), { migrationsFolder: './db' });
  await queryClient.end();
};

const withParts = (connectionString: string): [string, string] => {
  const connectionParts = connectionString?.split('/');
  const dbName = connectionParts.pop();
  // connectionParts.push('postgres');
  return [dbName!, connectionParts.join('/')];
};

const resetDB = async () => {
  const [dbName, connectionStr] = withParts(
    import.meta.env.POSTGRES_CONNECTION_STRING!,
  );

  const queryClient = postgres(connectionStr, { max: 1 });
  const db = drizzle(queryClient);
  await db.execute(sql.raw(`DROP DATABASE IF EXISTS "${dbName}";`));
  await db.execute(sql.raw(`CREATE DATABASE "${dbName}";`));
  await queryClient.end();
};

console.log('Resetting db...');
await resetDB();
console.log('Running migrations...');
await runMigration();

console.log('All done!');

process.exit(0);
