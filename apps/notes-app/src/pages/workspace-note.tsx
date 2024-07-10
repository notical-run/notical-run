import { useParams } from '@solidjs/router';
import { Editor } from '../components/Editor';
import { useNote } from '../api/queries/workspace';
import { Page } from '../components/Page';
import { links } from '../components/Navigation';
import { Show } from 'solid-js';

type Params = {
  workspaceSlug: string;
  noteId: string;
};

const WorkspaceNote = () => {
  const { workspaceSlug, noteId } = useParams<Params>();
  const noteResult = useNote(workspaceSlug, noteId);

  return (
    <Page
      breadcrumbs={[
        {
          text: <>{workspaceSlug}'s notes</>,
          href: links.workspaceNotes(workspaceSlug),
        },
        { text: <>{noteResult.data?.name ?? 'Loading...'}</> },
      ]}
    >
      <div class="px-2">
        <div class="mx-auto max-w-5xl">
          <div class="text-right text-sm text-slate-500">
            {noteResult.data?.name} by @{noteResult.data?.author.name}
          </div>
          <div class="border border-gray-200">
            <Show when={!!noteResult.data?.id} keyed>
              <Editor />
            </Show>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default WorkspaceNote;
