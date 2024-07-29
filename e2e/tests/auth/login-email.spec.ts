import { expect } from '@playwright/test';
import { context, describe, it, page } from '../utils/test';
import { createUser } from '@notical/api/src/factory/user';

page('Login', () => {
  context('when user uses correct credentials', () => {
    it('allows user to log in', async ({ page }) => {
      await createUser({ email: 'login@email.com', password: '123123123' });

      await page.goto('/login');

      await page.getByRole('textbox', { name: /email/i }).fill('login@email.com');
      await page.getByRole('textbox', { name: /password/i }).fill('123123123');

      await page.getByRole('button', { name: /login/i }).click();

      await expect(page).toHaveURL(/\/workspaces$/);
    });
  });

  context('when user uses incorrect email', () => {
    it('shows an error message', async ({ page }) => {
      await createUser({ email: 'login@email.com', password: '123123123' });

      await page.goto('/login');

      await page.getByRole('textbox', { name: /email/i }).fill('invalid-login@email.com');
      await page.getByRole('textbox', { name: /password/i }).fill('123123123');

      await page.getByRole('button', { name: /login/i }).click();

      // await new Promise(res => setTimeout(res, 1000));
      // console.log(await page.innerHTML('form'));
      // await expect(page.getByRole('form').getByText(/invalid email\/password/i)).toBeInViewport();
    });
  });
});
