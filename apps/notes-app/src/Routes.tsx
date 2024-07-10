import { Navigate, RouteDefinition, Router } from '@solidjs/router';
import Workspaces from './pages/workspaces';
import WorkspaceNotes from './pages/workspace-notes';
import WorkspaceNote from './pages/workspace-note';
import { Login } from './pages/login';
import { Signup } from './pages/signup';
import { PrivateRoute } from './components/Auth/Session';
import { links } from './components/Navigation';
import { Logout } from './pages/logout';

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
    path: '/logout',
    component: Logout,
  },
  {
    path: '/workspaces',
    component: PrivateRoute(Workspaces),
  },
  {
    path: '/:workspaceSlug',
    component: PrivateRoute(WorkspaceNotes),
    matchFilters: { workspaceSlug: /^@/ },
  },
  {
    path: '/:workspaceSlug/:noteId',
    component: WorkspaceNote,
    matchFilters: { workspaceSlug: /^@/ },
  },
  {
    path: '*',
    component: () => <Navigate href={links.workspaces()} />,
  },
];

export const Routes = () => {
  return <Router>{routes}</Router>;
};
