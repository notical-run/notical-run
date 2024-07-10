import { A, useParams } from '@solidjs/router';
import { useWorkspaceNotes } from '../api/queries/workspace';

type Params = {
  workspaceSlug: string;
};

const WorkspaceNotes = () => {
  const { workspaceSlug } = useParams<Params>();
  const notesResult = useWorkspaceNotes(workspaceSlug);

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
