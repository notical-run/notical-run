import { describe, beforeEach } from 'bun:test';
import { recreateDB, runMigration } from '../db/helpers';
import { createSession } from '../factory/user';

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

export const headers = async (options: { authenticatedUserId?: string } = {}) => {
  return {
    ...(options.authenticatedUserId
      ? { Authorization: `Bearer ${(await createSession(options.authenticatedUserId)).id}` }
      : {}),
    'Content-Type': 'application/json',
  };
};
