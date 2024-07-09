import { useParams, A } from '@solidjs/router';
import { Editor } from '../components/Editor';
import { createQuery } from '@tanstack/solid-query';
import { apiClient } from '../utils/api-client';

const WorkspaceNote = () => {
  const { workspaceSlug, noteId } = useParams<{
    workspaceSlug: string;
    noteId: string;
  }>();
  const noteResult = createQuery(() => ({
    queryKey: ['workspaces', workspaceSlug, 'notes', noteId],
    queryFn: async () =>
      apiClient.api.workspaces[':workspaceSlug'].notes[':noteId']
        .$get({ param: { workspaceSlug, noteId } })
        .then(x => x.json()),
  }));

  return (
    <div class="p-2">
      <A href={`/workspaces/${workspaceSlug}/notes`}>Back to notes</A>
      <h1>
        {noteResult.data?.name} by {noteResult.data?.author.name}
      </h1>
      <Editor />
    </div>
  );
};

export default WorkspaceNote;
