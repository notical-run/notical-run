import { A } from '@solidjs/router';
import { useWorkspaces } from '@/api/queries/workspace';
import { Page } from '@/components/Page';
import { links } from '@/components/Navigation';

const Workspaces = () => {
  const workspacesResult = useWorkspaces();

  return (
    <Page>
      <div class="mx-auto max-w-4xl">
        <h1 class="text-slate-400 font-bold">My Workspaces</h1>

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
    </Page>
  );
};

export default Workspaces;
