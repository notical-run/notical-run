import { createSignal, ParentProps } from 'solid-js';
import { Page } from '@/components/Page';
import { useWorkspaceContext } from '@/context/workspace';
import { WorkspaceSelector } from '@/components/WorkspaceSelector';
import { links } from '@/components/Navigation';
import { FiArchive, FiSettings } from 'solid-icons/fi';
import { Authorize } from '@/components/Auth/Session';
import { WorkspaceSettingsDialog } from '@/components/Workspace/WorkspaceSettingsDialog';

export const LayoutWorkspaceNotes = (props: ParentProps) => {
  const { slug } = useWorkspaceContext();
  const [dialogOpen, setDialogOpen] = createSignal(false);

  return (
    <Page title={`Notes in @${slug()}`}>
      <Page.Header breadcrumbs={[{ content: <WorkspaceSelector selected={slug()} /> }]} />

      <Page.Body>
        <Authorize user="logged_in" workspace="manage">
          <Page.Body.SideMenu>
            <Page.Body.SideMenuLink icon={<FiSettings />} onClick={() => setDialogOpen(true)}>
              Workspace settings
            </Page.Body.SideMenuLink>

            <Page.Body.SideMenuLink
              icon={<FiArchive />}
              href={links.archivedWorkspaceNotes(slug())}
            >
              Archived notes
            </Page.Body.SideMenuLink>
          </Page.Body.SideMenu>
        </Authorize>

        <Page.Body.Main>
          <div class="mx-auto max-w-4xl">{props.children}</div>
        </Page.Body.Main>
      </Page.Body>

      <WorkspaceSettingsDialog open={dialogOpen()} onOpenChange={setDialogOpen} />
    </Page>
  );
};

export const LayoutArchivedWorkspaceNotes = (props: ParentProps) => {
  const { slug } = useWorkspaceContext();

  return (
    <Page title={`Archived notes in @${slug()}`}>
      <Page.Header breadcrumbs={[{ content: <WorkspaceSelector selected={slug()} /> }]} />
      <Page.Body>
        <Page.Body.Main>
          <div class="mx-auto max-w-4xl">{props.children}</div>
        </Page.Body.Main>
      </Page.Body>
    </Page>
  );
};
