import { test } from '@playwright/test';
import { resetDB } from './db';

export const describe = test.describe;

export const it = test;

export const context = test.describe;

export const createPageCtx = (descr: (...a: any[]) => any) => (message: string, fn: () => void) => {
  descr(message, () => {
    test.beforeEach(async () => {
      await resetDB();
    });

    fn();
  });
};

export const page = Object.assign(createPageCtx(test.describe), {
  only: createPageCtx(test.describe.only),
});
