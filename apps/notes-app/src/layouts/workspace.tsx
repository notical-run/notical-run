import { useParams } from '@solidjs/router';
import { createContext, ParentProps, useContext } from 'solid-js';

export type WorkspaceContext = {
  slug: string;
};

const WorkspaceContext = createContext<WorkspaceContext>({ slug: '' });

export const useWorkspace = () => useContext(WorkspaceContext);

export const WorkspaceLayout = (props: ParentProps) => {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const slug = workspaceSlug.replace(/^@/, '');

  return (
    <WorkspaceContext.Provider value={{ slug }}>
      {props.children}
    </WorkspaceContext.Provider>
  );
};
