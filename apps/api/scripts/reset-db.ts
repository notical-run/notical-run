import { recreateDB, runMigration } from '../src/db/helpers';

if (!import.meta.env.POSTGRES_CONNECTION_STRING) {
  throw new Error('Missing POSTGRES_CONNECTION_STRING');
}

console.log('Recreating db...');
await recreateDB();

console.log('Running migrations...');
await runMigration();

console.log('All done!');

process.exit(0);
