import { describe, beforeEach } from 'bun:test';
import { recreateDB, runMigration } from '../db/helpers';

export const context = describe;

export const request = (message: string, fn: () => any) => {
  beforeEach(async () => {
    await cleanupData();
  });

  describe(message, fn);
};

export const response = { status: describe };

export const cleanupData = async () => {
  await recreateDB();
  await runMigration();
};
