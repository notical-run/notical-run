import { expect } from '@playwright/test';
import { describe, context, it, page } from '../utils/test';
import { loginAsUser } from '../utils/user';
import { factory } from '../utils/db';

page('Workspace notes', () => {
  context('when workspace does not exist', () => {
    it('shows error message', async ({ page }) => {
      await page.goto('/invalid-workspace');

      await expect(
        page.getByRole('heading', { name: `Workspace "invalid-workspace" not found` }),
      ).toBeVisible();
    });
  });

  context('when user is not authenticated', () => {
    it('does not show create new note button', async ({ page }) => {
      await factory.createWorkspace({ slug: 'workspace-1', access: 'private' });
      await page.goto('/workspace-1');

      await expect(page.getByRole('button', { name: 'New note', exact: true })).not.toBeVisible();
    });

    context('when workspace is private', () => {
      it('shows error message', async ({ page }) => {
        await factory.createWorkspace({ slug: 'workspace-1', access: 'private' });
        await page.goto('/workspace-1');

        await expect(
          page.getByRole('heading', { name: `You don't have access to workspace  "workspace-1"` }),
        ).toBeVisible();
      });
    });

    context('when workspace is public', () => {
      it('shows public notes', async ({ page }) => {
        const workspace = await factory.createWorkspace({ slug: 'workspace-1', access: 'public' });
        await Promise.all([
          factory.createNote({ name: 'note-1', access: 'public', workspaceId: workspace.id }),
          factory.createNote({ name: 'note-2', access: 'private', workspaceId: workspace.id }),
          factory.createNote({ name: 'note-3', access: 'public', workspaceId: workspace.id }),
        ]);
        await page.goto('/workspace-1');

        await expect(page.getByRole('heading', { name: `Notes` })).toBeVisible();
        await expect(page.getByRole('list')).toBeVisible();
        await expect(page.getByRole('listitem', { name: '@workspace-1/note-1' })).toBeVisible();
        await expect(page.getByRole('listitem', { name: '@workspace-1/note-2' })).not.toBeVisible();
        await expect(page.getByRole('listitem', { name: '@workspace-1/note-3' })).toBeVisible();
      });
    });
  });

  context('when the workspace belongs to a different user', () => {
    it('does not show create new note button', async ({ page }) => {
      await loginAsUser(page);
      const authorUser = await factory.createUser({ email: 'author@email.com' });
      await factory.createWorkspace({
        slug: 'workspace-1',
        access: 'private',
        authorId: authorUser.id,
      });
      await page.goto('/workspace-1');

      await expect(page.getByRole('button', { name: 'New note', exact: true })).not.toBeVisible();
    });

    context('when workspace is private', () => {
      it('shows error message', async ({ page }) => {
        await loginAsUser(page);
        const authorUser = await factory.createUser({ email: 'author@email.com' });
        await factory.createWorkspace({
          slug: 'workspace-1',
          access: 'private',
          authorId: authorUser.id,
        });
        await page.goto('/workspace-1');

        await expect(
          page.getByRole('heading', { name: `You don't have access to workspace  "workspace-1"` }),
        ).toBeVisible();
      });
    });

    context('when workspace is public', () => {
      it('shows public notes', async ({ page }) => {
        await loginAsUser(page);
        const authorUser = await factory.createUser({ email: 'author@email.com' });
        const workspace = await factory.createWorkspace({
          slug: 'workspace-1',
          access: 'public',
          authorId: authorUser.id,
        });
        await Promise.all([
          factory.createNote({ name: 'note-1', access: 'public', workspaceId: workspace.id }),
          factory.createNote({ name: 'note-2', access: 'private', workspaceId: workspace.id }),
          factory.createNote({ name: 'note-3', access: 'public', workspaceId: workspace.id }),
        ]);
        await page.goto('/workspace-1');

        await expect(page.getByRole('heading', { name: `Notes` })).toBeVisible();
        await expect(page.getByRole('list')).toBeVisible();
        await expect(page.getByRole('listitem', { name: '@workspace-1/note-1' })).toBeVisible();
        await expect(page.getByRole('listitem', { name: '@workspace-1/note-2' })).not.toBeVisible();
        await expect(page.getByRole('listitem', { name: '@workspace-1/note-3' })).toBeVisible();
      });
    });
  });

  context('when the workspace belongs to the logged-in user', () => {
    it('shows create new note button', async ({ page }) => {
      const user = await loginAsUser(page);
      await factory.createWorkspace({
        slug: 'workspace-1',
        access: 'private',
        authorId: user.id,
      });
      await page.goto('/workspace-1');

      await expect(page.getByRole('button', { name: 'New note', exact: true })).toBeVisible();
    });

    context('when workspace is private', () => {
      it('shows all notes', async ({ page }) => {
        const user = await loginAsUser(page);
        const workspace = await factory.createWorkspace({
          slug: 'workspace-1',
          access: 'private',
          authorId: user.id,
        });
        await Promise.all([
          factory.createNote({ name: 'note-1', access: 'public', workspaceId: workspace.id }),
          factory.createNote({ name: 'note-2', access: 'private', workspaceId: workspace.id }),
          factory.createNote({ name: 'note-3', access: 'public', workspaceId: workspace.id }),
        ]);
        await page.goto('/workspace-1');

        await expect(page.getByRole('heading', { name: `Notes` })).toBeVisible();
        await expect(page.getByRole('list')).toBeVisible();
        await expect(page.getByRole('listitem', { name: '@workspace-1/note-1' })).toBeVisible();
        await expect(page.getByRole('listitem', { name: '@workspace-1/note-2' })).toBeVisible();
        await expect(page.getByRole('listitem', { name: '@workspace-1/note-3' })).toBeVisible();
      });
    });

    context('when workspace is public', () => {
      it('shows all notes', async ({ page }) => {
        const user = await loginAsUser(page);
        const workspace = await factory.createWorkspace({
          slug: 'workspace-1',
          access: 'public',
          authorId: user.id,
        });
        await Promise.all([
          factory.createNote({ name: 'note-1', access: 'public', workspaceId: workspace.id }),
          factory.createNote({ name: 'note-2', access: 'private', workspaceId: workspace.id }),
          factory.createNote({ name: 'note-3', access: 'public', workspaceId: workspace.id }),
        ]);
        await page.goto('/workspace-1');

        await expect(page.getByRole('heading', { name: `Notes` })).toBeVisible();
        await expect(page.getByRole('list')).toBeVisible();
        await expect(page.getByRole('listitem', { name: '@workspace-1/note-1' })).toBeVisible();
        await expect(page.getByRole('listitem', { name: '@workspace-1/note-2' })).toBeVisible();
        await expect(page.getByRole('listitem', { name: '@workspace-1/note-3' })).toBeVisible();
      });
    });

    describe('create note flow', () => {
      context('when note id is valid', () => {
        it('creates a new note', async ({ page }) => {
          const user = await loginAsUser(page);
          await factory.createWorkspace({
            slug: 'workspace-1',
            access: 'private',
            authorId: user.id,
          });
          await page.goto('/workspace-1');

          await page.getByRole('button', { name: 'New note', exact: true }).click();

          const newNoteDialog = page.getByRole('dialog');
          await expect(newNoteDialog.getByRole('heading', { name: /new note/i })).toBeVisible();

          await newNoteDialog.getByRole('textbox', { name: /note id/i }).fill('new-note-id');

          await newNoteDialog.getByRole('button', { name: 'Create' }).click();

          await expect(page.getByRole('status')).toHaveText(/note new-note-id created/i);
          await expect(newNoteDialog).not.toBeVisible();

          await expect(page).toHaveURL('/@workspace-1/new-note-id');
        });
      });

      context('when note id is invalid', () => {
        it('shows an error message', async ({ page }) => {
          const user = await loginAsUser(page);
          await factory.createWorkspace({
            slug: 'workspace-1',
            access: 'private',
            authorId: user.id,
          });
          await page.goto('/workspace-1');

          await page.getByRole('button', { name: 'New note', exact: true }).click();

          const newNoteDialog = page.getByRole('dialog');
          await expect(newNoteDialog.getByRole('heading', { name: /new note/i })).toBeVisible();

          await newNoteDialog.getByRole('textbox', { name: /note id/i }).fill('invalid note id');

          await newNoteDialog.getByRole('button', { name: 'Create' }).click();

          await expect(newNoteDialog.getByRole('alert')).toHaveText('Name must not contain spaces');
        });
      });
    });
  });
});
