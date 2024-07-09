import { createQuery } from '@tanstack/solid-query';
import { apiClient } from '../utils/api-client';
import { A } from '@solidjs/router';

const Workspaces = () => {
  const workspacesResult = createQuery(() => ({
    queryKey: ['workspaces'],
    queryFn: async () => apiClient.api.workspaces.$get().then(x => x.json()),
  }));

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
