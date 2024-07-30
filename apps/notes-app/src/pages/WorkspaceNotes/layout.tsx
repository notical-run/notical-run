import { ParentProps } from 'solid-js';
import { Page } from '@/components/Page';
import { useWorkspaceContext } from '@/context/workspace';
import { WorkspaceSelector } from '@/components/WorkspaceSelector';
import { links } from '@/components/Navigation';
import { FiArchive } from 'solid-icons/fi';

export const LayoutWorkspaceNotes = (props: ParentProps) => {
  const { slug } = useWorkspaceContext();

  return (
    <Page title={`Notes in @${slug()}`}>
      <Page.Header breadcrumbs={[{ content: <WorkspaceSelector selected={slug()} /> }]} />

      <Page.Body>
        <Page.Body.SideMenu>
          <Page.Body.SideMenuLink icon={<FiArchive />} href={links.archivedWorkspaceNotes(slug())}>
            Archived notes
          </Page.Body.SideMenuLink>
        </Page.Body.SideMenu>

        <Page.Body.Main>
          <div class="mx-auto max-w-4xl">{props.children}</div>
        </Page.Body.Main>
      </Page.Body>
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
