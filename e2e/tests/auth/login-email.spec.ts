import { expect } from '@playwright/test';
import { context, it, page } from '../utils/test';
import { factory } from '../utils/db';

page('Login', () => {
  context('when user uses correct credentials', () => {
    it('allows user to log in', async ({ page }) => {
      await factory.createUser({ email: 'login@email.com', password: '123123123' });
      await page.goto('/login');

      await page.getByRole('textbox', { name: /email/i }).fill('login@email.com');
      await page.getByRole('textbox', { name: /password/i }).fill('123123123');

      await page.getByRole('button', { name: /login/i }).click();

      await expect(page).toHaveURL(/\/workspaces$/);
    });
  });

  context('when user uses incorrect email', () => {
    it('shows an error message', async ({ page }) => {
      await page.goto('/login');

      await page.getByRole('textbox', { name: /email/i }).fill('invalid-login@email.com');
      await page.getByRole('textbox', { name: /password/i }).fill('123123123');

      await page.getByRole('button', { name: /login/i }).click();

      await expect(page.getByRole('alert')).toBeVisible();
      await expect(page.getByRole('alert')).toHaveText(/invalid email\/password/gi);
    });
  });

  context('when user uses incorrect password', () => {
    it('shows an error message', async ({ page }) => {
      await factory.createUser({ email: 'login@email.com', password: '123123123' });
      await page.goto('/login');

      await page.getByRole('textbox', { name: /email/i }).fill('login@email.com');
      await page.getByRole('textbox', { name: /password/i }).fill('wrong password');

      await page.getByRole('button', { name: /login/i }).click();

      await expect(page.getByRole('alert')).toBeVisible();
      await expect(page.getByRole('alert')).toHaveText(/invalid email\/password/gi);
    });
  });
});
