import { expect, Page } from '@playwright/test';
import { context, describe, it, page } from '../utils/test';
import { createUser } from '@notical/api/src/factory/user';
import { createWorkspace } from '@notical/api/src/factory/workspace';

const loginAsUser = async (
  page: Page,
  email: string = 'login@email.com',
  password: string = '123123123',
) => {
  const user = await createUser({ email, password });

  await page.goto('/login');

  const response = await page.request.post(`${import.meta.env.API_BASE_URL}/api/auth/login`, {
    data: { email, password },
  });

  let responseJson: any;
  const responseBody = await response.text();
  try {
    responseJson = JSON.parse(responseBody);
    if (!responseJson.sessionId) throw new Error('No session id in response');
  } catch (e) {
    throw new Error(`Invalid response from login: ${responseBody}`);
  }

  await page.evaluate(
    (sessionId: string) => localStorage.setItem('session-id', sessionId),
    responseJson.sessionId,
  );

  return user;
};

page('My workspaces', () => {
  context('when user has no workspaces', () => {
    it('shows the empty state', async ({ page }) => {
      await loginAsUser(page);
      await page.goto('/workspaces');

      await expect(
        page.getByRole('heading', { name: `You don't have any workspaces` }),
      ).toBeVisible();
    });
  });

  context('when user has some workspaces', () => {
    it('shows the empty state', async ({ page }) => {
      const user = await loginAsUser(page);
      await createWorkspace({ slug: 'my-workspace', authorId: user.id });
      await page.goto('/workspaces');

      await expect(page.getByRole('list', { name: `My workspaces` })).toBeVisible();
      await expect(page.getByRole('listitem', { name: /workspace my-workspace/i })).toBeVisible();
    });
  });

  describe('create new workspace flow', () => {
    context('when user inputs workspace name', () => {
      it('prefills the slug for the given name', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/workspaces');

        await page.getByRole('button', { name: /create a new workspace/i }).click();

        const newWorkspaceDialog = page.getByRole('dialog', { name: /new workspace/i });

        await expect(newWorkspaceDialog).toBeVisible();

        await newWorkspaceDialog
          .getByRole('textbox', { name: /workspace name/i })
          .fill('New workspace');

        await expect(
          newWorkspaceDialog.getByRole('textbox', { name: /workspace id/i }),
        ).toHaveValue('new-workspace');
      });
    });

    context('user hits submit with correct inputs', () => {
      it('prefills the slug for the given name', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/workspaces');

        await page.getByRole('button', { name: /create a new workspace/i }).click();

        const newWorkspaceDialog = page.getByRole('dialog', { name: /new workspace/i });

        await expect(newWorkspaceDialog).toBeVisible();

        await newWorkspaceDialog
          .getByRole('textbox', { name: /workspace name/i })
          .fill('New workspace');

        await newWorkspaceDialog.getByRole('button', { name: /create/i }).click();

        await expect(page.getByRole('status')).toHaveText(/workspace new-workspace created/i);

        await expect(page).toHaveURL('/new-workspace');
      });
    });
  });
});
