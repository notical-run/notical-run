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

export const delay = (duration: number, val?: any) =>
  new Promise(res => setTimeout(() => res(val), duration));

export const cleanupData = async (attempts: number = 3) => {
  try {
    await recreateDB();
    await runMigration();
  } catch (e) {
    if (attempts > 0) {
      console.log('----------------- retrying --------------------');
      await delay(1000);
      await cleanupData(attempts - 1);
    } else {
      throw e;
    }
  }
};

export const headers = async (options: { authenticatedUserId?: string } = {}) => {
  return {
    ...(options.authenticatedUserId
      ? { Authorization: `Bearer ${(await createSession(options.authenticatedUserId)).id}` }
      : {}),
    'Content-Type': 'application/json',
  };
};
