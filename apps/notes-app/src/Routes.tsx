import { Navigate, RouteDefinition, Router } from '@solidjs/router';
import WorkspaceNotes from './pages/WorkspaceNotes';
import WorkspaceNote from './pages/Note';
import Workspaces from './pages/Workspaces';
import Login from './pages/login';
import Signup from './pages/signup';
import { PrivateRoute } from './components/Auth/Session';
import { links } from './components/Navigation';
import Logout from './pages/logout';
import { WorkspaceLayout } from '@/layouts/workspace';
import ArchivedWorkspaceNotes from '@/pages/WorkspaceNotes/archived';

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
    component: () => (
      <PrivateRoute>
        <Workspaces />
      </PrivateRoute>
    ),
  },

  {
    path: '/:workspaceSlug',
    component: () => (
      <WorkspaceLayout>
        <PrivateRoute>
          <WorkspaceNotes />
        </PrivateRoute>
      </WorkspaceLayout>
    ),
  },
  {
    path: '/:workspaceSlug/archived',
    component: () => (
      <WorkspaceLayout>
        <PrivateRoute>
          <ArchivedWorkspaceNotes />
        </PrivateRoute>
      </WorkspaceLayout>
    ),
  },

  {
    path: '/:workspaceSlug/:noteId',
    component: () => (
      <WorkspaceLayout>
        <WorkspaceNote />
      </WorkspaceLayout>
    ),
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
