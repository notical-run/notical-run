import { createSignal, For, Show } from 'solid-js';
import { A, useParams } from '@solidjs/router';
import { useWorkspaceNotes } from '@/api/queries/workspace';
import { Page } from '@/components/Page';
import { links } from '@/components/Navigation';
import { Button } from '@/components/_base/Button';
import { NewNoteDialog } from '@/pages/WorkspaceNotes/components/NewNoteDialog';

type Params = {
  workspaceSlug: string;
};

const WorkspaceNotes = () => {
  const { workspaceSlug } = useParams<Params>();
  const slug = workspaceSlug.replace(/^@/, '');
  const notesResult = useWorkspaceNotes(slug);

  const [dialogOpen, setDialogOpen] = createSignal(false);

  return (
    <Page breadcrumbs={[{ text: <>@{slug}</> }]}>
      <div class="flex justify-end pb-2">
        <Button onClick={() => setDialogOpen(true)} class="text-sm">
          + New note
        </Button>
      </div>

      <Show when={!notesResult.isLoading} fallback={<div>Loading...</div>}>
        <div class="mx-auto max-w-4xl">
          <For each={notesResult.data} fallback={<div>No notes</div>}>
            {note => (
              <A
                href={links.workspaceNote(slug, note.name)}
                class="block px-4 py-3 shadow-sm rounded-md border border-gray-100 mb-2 text-slate-700"
              >
                <div>
                  <div>
                    <span class="text-slate-500">@{slug}</span>/
                    <span class="text-slate-900 font-bold">{note.name}</span>
                  </div>
                </div>
              </A>
            )}
          </For>
        </div>
      </Show>

      <NewNoteDialog open={dialogOpen()} onOpenChange={setDialogOpen} />
    </Page>
  );
};

export default WorkspaceNotes;
