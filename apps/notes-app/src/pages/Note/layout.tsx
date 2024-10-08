import { useParams } from '@solidjs/router';
import { Page } from '@/components/Page';
import { ParentProps } from 'solid-js';
import { useWorkspaceContext } from '@/context/workspace';
import { WorkspaceSelector } from '@/components/WorkspaceSelector';
import { NoteSidebar } from '@/pages/Note/components/Sidebar';
import { Authorize } from '@/components/Auth/Session';

export const LayoutWorkspaceNote = (props: ParentProps) => {
  const { slug } = useWorkspaceContext();
  const params = useParams<{ noteId: string }>();

  return (
    <Page title={`@${slug()}/${params.noteId}`}>
      <Page.Header
        breadcrumbs={[
          { content: <WorkspaceSelector selected={slug()} /> },
          { content: <>{params.noteId}</> },
        ]}
      />
      <Page.Body>
        <Authorize workspace="view">
          <Page.Body.SideMenu>
            <NoteSidebar />
          </Page.Body.SideMenu>
        </Authorize>

        <Page.Body.Main>
          <div class="px-2">
            <div class="mx-auto max-w-4xl">{props.children}</div>
          </div>
        </Page.Body.Main>
      </Page.Body>
    </Page>
  );
};
