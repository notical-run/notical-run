import { useWorkspace, WorkspaceQueryResult } from '@/api/queries/workspace';
import { useParams } from '@solidjs/router';
import { Accessor, createContext, createMemo, ParentProps, useContext } from 'solid-js';

export type WorkspaceContext = {
  slug: Accessor<string>;
  workspace: Accessor<WorkspaceQueryResult | undefined>;
};

const WorkspaceContext = createContext<WorkspaceContext>();

export const useWorkspaceContext = () =>
  useContext(WorkspaceContext) ?? { slug: () => '', workspace: () => undefined };

export const WorkspaceProvider = (props: ParentProps) => {
  const params = useParams<{ workspaceSlug: string }>();
  const slug = createMemo(() => params.workspaceSlug.replace(/^@/, ''));
  const workspaceQuery = useWorkspace(slug);

  return (
    <WorkspaceContext.Provider value={{ slug, workspace: () => workspaceQuery.data }}>
      {props.children}
    </WorkspaceContext.Provider>
  );
};
