import { useParams } from '@solidjs/router';
import { Accessor, createContext, createMemo, ParentProps, useContext } from 'solid-js';

export type WorkspaceContext = {
  slug: Accessor<string>;
};

const WorkspaceContext = createContext<WorkspaceContext>();

export const useWorkspaceContext = () => useContext(WorkspaceContext) ?? { slug: () => '' };

export const WorkspaceLayout = (props: ParentProps) => {
  const params = useParams<{ workspaceSlug: string }>();
  const slug = createMemo(() => params.workspaceSlug.replace(/^@/, ''));

  return <WorkspaceContext.Provider value={{ slug }}>{props.children}</WorkspaceContext.Provider>;
};
