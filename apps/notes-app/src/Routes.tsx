import { Navigate, RouteDefinition, Router } from '@solidjs/router';
import { WorkspaceProvider } from '@/context/workspace';
import { lazy } from 'solid-js';
import { LayoutWorkspaces } from '@/pages/Workspaces/layout';
import { LayoutArchivedWorkspaceNotes, LayoutWorkspaceNotes } from '@/pages/WorkspaceNotes/layout';
import { LayoutWorkspaceNote } from '@/pages/Note/layout';
import Login from './pages/login';
import Signup from './pages/signup';
import { PrivateRoute } from './components/Auth/Session';
import { links } from './components/Navigation';
import Logout from './pages/logout';

const Workspaces = lazy(() => import('./pages/Workspaces'));
const WorkspaceNotes = lazy(() => import('./pages/WorkspaceNotes'));
const ArchivedWorkspaceNotes = lazy(() => import('./pages/WorkspaceNotes/archived'));
const WorkspaceNote = lazy(() => import('./pages/Note'));

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
        <LayoutWorkspaces>
          <Workspaces />
        </LayoutWorkspaces>
      </PrivateRoute>
    ),
  },

  {
    path: '/:workspaceSlug',
    component: () => (
      <PrivateRoute>
        <WorkspaceProvider>
          <LayoutWorkspaceNotes>
            <WorkspaceNotes />
          </LayoutWorkspaceNotes>
        </WorkspaceProvider>
      </PrivateRoute>
    ),
  },
  {
    path: '/:workspaceSlug/archived',
    component: () => (
      <PrivateRoute>
        <WorkspaceProvider>
          <LayoutArchivedWorkspaceNotes>
            <ArchivedWorkspaceNotes />
          </LayoutArchivedWorkspaceNotes>
        </WorkspaceProvider>
      </PrivateRoute>
    ),
  },

  {
    path: '/:workspaceSlug/:noteId',
    component: () => (
      <WorkspaceProvider>
        <LayoutWorkspaceNote>
          <WorkspaceNote />
        </LayoutWorkspaceNote>
      </WorkspaceProvider>
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
