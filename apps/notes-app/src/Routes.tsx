import { Navigate, RouteDefinition, Router } from '@solidjs/router';
import Workspaces from './pages/workspaces';
import WorkspaceNotes from './pages/workspace-notes';
import WorkspaceNote from './pages/workspace-note';

export const routes: RouteDefinition[] = [
  {
    path: '/workspaces',
    component: Workspaces,
  },
  {
    path: '/workspaces/:workspaceSlug/notes',
    component: WorkspaceNotes,
  },
  {
    path: '/workspaces/:workspaceSlug/notes/:noteId',
    component: WorkspaceNote,
  },
  {
    path: '*',
    component: () => <Navigate href="/workspaces" />,
  },
];

export const Routes = () => {
  return <Router>{routes}</Router>;
};
