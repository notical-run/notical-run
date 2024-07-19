import { A } from '@solidjs/router';
import { useWorkspaces } from '@/api/queries/workspace';
import { Page } from '@/components/Page';
import { links } from '@/components/Navigation';
import { NewWorkspaceDialog } from '@/pages/Workspaces/components/NewWorkspaceDialog';
import { createSignal } from 'solid-js';
import { Button } from '@/components/_base/Button';
import { FaSolidPlus } from 'solid-icons/fa';

const Workspaces = () => {
  const workspacesResult = useWorkspaces();

  const [dialogOpen, setDialogOpen] = createSignal(false);

  return (
    <Page>
      <div class="mx-auto max-w-4xl">
        <div class="flex items-end justify-between pb-2">
          <h1 class="text-slate-400 font-bold">My Workspaces</h1>

          <Button onClick={() => setDialogOpen(true)} class="text-sm flex items-center gap-2">
            <FaSolidPlus size={10} />
            New workspace
          </Button>
        </div>

        {workspacesResult.data?.map(workspace => (
          <A
            href={links.workspaceNotes(workspace.slug)}
            class="block px-4 py-3 shadow-sm rounded-md border border-slate-150 mb-2"
          >
            <div class="pb-1">
              {workspace.name} (<span class="text-slate-900 font-bold">@{workspace.slug}</span>)
            </div>
            <div class="text-slate-600 text-sm">{workspace.notes.length} notes</div>
          </A>
        ))}
      </div>

      <NewWorkspaceDialog open={dialogOpen()} onOpenChange={setDialogOpen} />
    </Page>
  );
};

export default Workspaces;
