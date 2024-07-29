import { test } from '@playwright/test';
import { cleanupData } from '@notical/api/src/utils/test';

export const describe = test.describe;

export const it = test;

export const context = test.describe;

export const page = (message: string, fn: () => void) => {
  test.beforeEach(async () => {
    await cleanupData();
  });

  describe(message, fn);
};
