import { useParams, A } from '@solidjs/router';
import { Editor } from '../components/Editor';
import { useNote } from '../api/queries/workspace';

type Params = {
  workspaceSlug: string;
  noteId: string;
};

const WorkspaceNote = () => {
  const { workspaceSlug, noteId } = useParams<Params>();
  const noteResult = useNote(workspaceSlug, noteId);

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
