import { useParams } from '@solidjs/router';
import { useNote } from '../../api/queries/workspace';
import { Page } from '../../components/Page';
import { Show } from 'solid-js';
import { useWorkspaceContext } from '@/layouts/workspace';
import { WorkspaceSelector } from '@/components/WorkspaceSelector';
import { NoteSidebar } from '@/pages/Note/components/Sidebar';
import { NoteEditor } from '@/pages/Note/components/NoteEditor';

const WorkspaceNote = () => {
  const { slug } = useWorkspaceContext();
  const params = useParams<{ noteId: string }>();
  const noteQuery = useNote(slug, () => params.noteId);

  return (
    <Page>
      <Page.Header
        breadcrumbs={[
          { content: <WorkspaceSelector selected={slug()} /> },
          { content: <>{noteQuery.data?.name ?? 'Loading...'}</> },
        ]}
      />
      <Page.Body>
        <Page.Body.SideMenu>
          <NoteSidebar />
        </Page.Body.SideMenu>

        <Page.Body.Main>
          <div class="px-2">
            <div class="mx-auto max-w-4xl">
              <div class="text-right text-sm text-slate-500">
                @{slug()}/{noteQuery.data?.name} by {noteQuery.data?.author?.name}
              </div>
              <Show when={noteQuery.data?.id} keyed>
                <NoteEditor note={noteQuery.data!} />
              </Show>
            </div>
          </div>
        </Page.Body.Main>
      </Page.Body>
    </Page>
  );
};

export default WorkspaceNote;
