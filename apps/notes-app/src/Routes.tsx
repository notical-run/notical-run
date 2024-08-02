import { lazy } from 'solid-js';
import { Navigate, RouteDefinition, Router } from '@solidjs/router';
import { WorkspaceProvider } from '@/context/workspace';
import { PrivateRoute } from '@/components/Auth/Session';
import { links } from '@/components/Navigation';
import { LayoutWorkspaces } from '@/pages/Workspaces/layout';
import { LayoutArchivedWorkspaceNotes, LayoutWorkspaceNotes } from '@/pages/WorkspaceNotes/layout';
import { LayoutWorkspaceNote } from '@/pages/Note/layout';
import { LayoutLogin, LayoutSignup } from '@/pages/Auth/layout';

const Workspaces = lazy(() => import('./pages/Workspaces'));
const WorkspaceNotes = lazy(() => import('./pages/WorkspaceNotes'));
const ArchivedWorkspaceNotes = lazy(() => import('./pages/WorkspaceNotes/archived'));
const WorkspaceNote = lazy(() => import('./pages/Note'));
const Logout = lazy(() => import('./pages/Auth/logout'));
const Login = lazy(() => import('./pages/Auth/login'));
const Signup = lazy(() => import('./pages/Auth/signup'));

export const routes: RouteDefinition[] = [
  {
    path: '/login',
    component: () => (
      <LayoutLogin>
        <Login />
      </LayoutLogin>
    ),
  },
  {
    path: '/signup',
    component: () => (
      <LayoutSignup>
        <Signup />
      </LayoutSignup>
    ),
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
      <WorkspaceProvider>
        <LayoutWorkspaceNotes>
          <WorkspaceNotes />
        </LayoutWorkspaceNotes>
      </WorkspaceProvider>
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
