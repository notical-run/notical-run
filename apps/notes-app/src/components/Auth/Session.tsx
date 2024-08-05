import { Navigate } from '@solidjs/router';
import { createSignal, JSX, Match, ParentProps, Show, Switch } from 'solid-js';
import { getSessionId, setSessionId } from '../../utils/api-client';
import { links } from '../Navigation';
import { useCurrentUser } from '@/api/queries/user';
import { and } from '@/utils/solid-helpers';
import { useWorkspaceContext } from '@/context/workspace';

export const useSessionId = () => {
  const [sessionId, setSid] = createSignal(getSessionId());

  const updateSessionId = (newSessionId: string) => {
    setSid(newSessionId);
    setSessionId(newSessionId);
  };

  return [sessionId, updateSessionId] as const;
};

export const IfAuthenticated = (props: ParentProps<{ fallback?: JSX.Element }>) => {
  const [sessionId] = useSessionId();
  return (
    <Show when={sessionId()} fallback={props.fallback}>
      {props.children}
    </Show>
  );
};

export const useAuthorizationRules = () => {
  const userQuery = useCurrentUser();
  const { workspace } = useWorkspaceContext();
  const [sessionId] = useSessionId();

  return {
    workspace: {
      view: () => workspace()?.permissions.canViewNotes,
      create_notes: () => workspace()?.permissions.canCreateNotes,
      manage: () => workspace()?.permissions.canManage,
    },
    user: {
      logged_in: () => and(sessionId(), userQuery.data?.id),
      ready: () => !userQuery.isLoading,
      session: () => Boolean(sessionId()),
    },
  } as const;
};

export const Authorize = (
  props: ParentProps<{
    user?: keyof ReturnType<typeof useAuthorizationRules>['user'];
    workspace?: keyof ReturnType<typeof useAuthorizationRules>['workspace'];
    fallback?: JSX.Element;
  }>,
) => {
  const rules = useAuthorizationRules();

  const isWorkspaceAuthorized = props.workspace && rules.workspace[props.workspace];
  const userAuth = props.user && rules.user[props.user];

  return (
    <Switch>
      <Match when={and(props.user, !userAuth?.())}>{props.fallback}</Match>
      <Match when={and(props.workspace, !isWorkspaceAuthorized?.())}>{props.fallback}</Match>
      <Match when={true}>{props.children}</Match>
    </Switch>
  );
};

export const PrivateRoute = (props: ParentProps) => (
  <IfAuthenticated fallback={<Navigate href={links.login()} />}>{props.children}</IfAuthenticated>
);
