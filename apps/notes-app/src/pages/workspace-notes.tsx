import { A, useParams } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import { apiClient } from '../utils/api-client';

const WorkspaceNotes = () => {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const notesResult = createQuery(() => ({
    queryKey: ['workspaces', workspaceSlug, 'notes'],
    queryFn: async () =>
      apiClient.api.workspaces[':workspaceSlug'].notes
        .$get({ param: { workspaceSlug } })
        .then(x => x.json()),
  }));

  return (
    <div>
      <A href={`/workspaces`}>Back to workspaces</A>
      <h1>Notes in {workspaceSlug}</h1>
      <div>
        {notesResult.data?.map(note => (
          <A
            href={`/workspaces/${workspaceSlug}/notes/${note.id}`}
            class="block"
          >
            <div>
              @{workspaceSlug}/{note.id} ({note.name})
            </div>
          </A>
        ))}
      </div>
    </div>
  );
};

export default WorkspaceNotes;
