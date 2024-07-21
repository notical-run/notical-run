import { useNavigate, useParams } from '@solidjs/router';
import { useArchiveNote, useNote } from '../../api/queries/workspace';
import { Page } from '../../components/Page';
import { Match, Show, Switch } from 'solid-js';
import { useWorkspaceContext } from '@/layouts/workspace';
import { WorkspaceSelector } from '@/components/WorkspaceSelector';
import { NoteSidebar } from '@/pages/Note/components/Sidebar';
import { NoteEditor } from '@/pages/Note/components/NoteEditor';
import { LoadingView, ErrorView } from '@/components/ViewStates';
import { toApiErrorMessage } from '@/utils/api-client';
import toast from 'solid-toast';
import { links } from '@/components/Navigation';
import { Button } from '@/components/_base/Button';
import { FiArchive } from 'solid-icons/fi';

const WorkspaceNote = () => {
  const { slug } = useWorkspaceContext();
  const params = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const noteQuery = useNote(slug, () => params.noteId);

  const noteArchiver = useArchiveNote(slug(), noteQuery.data?.name ?? '');

  const archiveNote = () =>
    noteArchiver.mutate(undefined, {
      onSuccess() {
        toast.success(`Note ${noteQuery.data?.name} has been archived`);
        navigate(links.workspaceNotes(slug()));
      },
    });

  return (
    <Page title={`@${slug()}/${params.noteId}`}>
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
          <Switch>
            <Match when={noteQuery.isLoading}>
              <LoadingView />
            </Match>

            <Match when={noteQuery.isError}>
              <ErrorView title={toApiErrorMessage(noteQuery.error) ?? undefined} />
            </Match>

            <Match when={noteQuery.isSuccess}>
              <div class="px-2">
                <div class="mx-auto max-w-4xl">
                  <div class="flex justify-end gap-2 text-sm text-slate-500">
                    @{slug()}/{noteQuery.data?.name} by {noteQuery.data?.author?.name}
                    <Button
                      size="sm"
                      variant="primary-bordered"
                      onClick={archiveNote}
                      disabled={noteArchiver.isPending}
                      title="Archive"
                    >
                      <FiArchive />
                    </Button>
                  </div>
                  <Show when={noteQuery.data?.id} keyed>
                    <NoteEditor note={noteQuery.data!} />
                  </Show>
                </div>
              </div>
            </Match>
          </Switch>
        </Page.Body.Main>
      </Page.Body>
    </Page>
  );
};

export default WorkspaceNote;
