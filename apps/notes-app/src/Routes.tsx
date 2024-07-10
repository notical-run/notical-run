import { Navigate, RouteDefinition, Router } from '@solidjs/router';
import Workspaces from './pages/workspaces';
import WorkspaceNotes from './pages/workspace-notes';
import WorkspaceNote from './pages/workspace-note';
import { Login } from './pages/login';
import { Signup } from './pages/signup';
import { PrivateRoute } from './components/Auth/Session';

export const routes: RouteDefinition[] = [
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/signup',
    component: Signup,
  },
  {
    path: '/workspaces',
    component: PrivateRoute(Workspaces),
  },
  {
    path: '/workspaces/:workspaceSlug/notes',
    component: PrivateRoute(WorkspaceNotes),
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
