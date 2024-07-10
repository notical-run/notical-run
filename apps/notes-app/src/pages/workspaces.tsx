import { A } from '@solidjs/router';
import { useWorkspaces } from '../api/queries/workspace';

const Workspaces = () => {
  const workspacesResult = useWorkspaces();

  return (
    <div>
      <h1>Workspaces</h1>
      <div>
        {workspacesResult.data?.map(workspace => (
          <A href={`/workspaces/${workspace.slug}/notes`} class="block">
            <div>
              @{workspace.slug} ({workspace.name}){' '}
            </div>
          </A>
        ))}
      </div>
    </div>
  );
};

export default Workspaces;
