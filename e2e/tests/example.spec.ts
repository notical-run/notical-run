import { test, expect } from '@playwright/test';

test.describe('signup', () => {
  test('signin', async ({ page }) => {
    await page.goto('/signup');

    // throw new Error('fuck');

    // Expect a title "to contain" a substring.
    await expect(page.getByRole('button', { name: /signup/i })).toBeInViewport();
  });
});
