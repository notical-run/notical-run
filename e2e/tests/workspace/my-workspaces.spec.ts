import { expect } from '@playwright/test';
import { context, describe, it, page } from '../utils/test';
import { loginAsUser } from '../utils/user';
import { factory } from '../utils/db';

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
    it('shows the workspaces', async ({ page }) => {
      const user = await loginAsUser(page);
      await factory.createWorkspace({ slug: 'my-workspace-1', authorId: user.id });
      await factory.createWorkspace({ slug: 'my-workspace-2', authorId: user.id });
      await page.goto('/workspaces');

      await expect(page.getByRole('list', { name: `My workspaces` })).toBeVisible();

      // List items
      await expect(page.getByRole('listitem', { name: /workspace my-workspace-1/i })).toBeVisible();
      await expect(page.getByRole('listitem', { name: /workspace my-workspace-2/i })).toBeVisible();
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

    context('user submits with correct inputs', () => {
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

    context('user inputs invalid workspace slug', () => {
      it('shows an error message', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/workspaces');

        await page.getByRole('button', { name: /create a new workspace/i }).click();

        const newWorkspaceDialog = page.getByRole('dialog', { name: /new workspace/i });

        await expect(newWorkspaceDialog).toBeVisible();

        await newWorkspaceDialog
          .getByRole('textbox', { name: /workspace name/i })
          .fill('New workspace');
        await newWorkspaceDialog
          .getByRole('textbox', { name: /workspace id/i })
          .fill('invalid workspace id');

        await newWorkspaceDialog.getByRole('button', { name: /create/i }).click();

        await expect(newWorkspaceDialog.getByRole('alert')).toHaveText(
          'ID must not contain spaces',
        );
      });
    });
  });
});
