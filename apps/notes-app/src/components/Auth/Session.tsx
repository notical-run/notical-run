import { Navigate } from '@solidjs/router';
import { createSignal, JSX, Match, ParentProps, Show, Switch } from 'solid-js';
import { getSessionId, setSessionId } from '../../utils/api-client';
import { links } from '../Navigation';
import { useCurrentUser } from '@/api/queries/user';
import { and, or } from '@/utils/solid-helpers';
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

export const Authorize = (
  props: ParentProps<{
    user?: 'logged_in';
    workspace?: 'view' | 'create_notes' | 'manage';
    fallback?: JSX.Element;
  }>,
) => {
  const [sessionId] = useSessionId();
  const userQuery = useCurrentUser();
  const { workspace } = useWorkspaceContext();

  const isLoggedIn = () => and(props.user ?? false, userQuery.data?.id, userQuery.isSuccess);

  const authorized = () => or(!props.user, isLoggedIn());

  return (
    <Switch>
      <Match when={and(props.user === 'logged_in', !sessionId())}>{props.fallback}</Match>
      <Match when={and(props.user === 'logged_in', userQuery.isError)}>{props.fallback}</Match>
      <Match when={and(props.workspace === 'view', !workspace()?.permissions.canViewNotes)}>
        {props.fallback}
      </Match>
      <Match
        when={and(props.workspace === 'create_notes', !workspace()?.permissions.canCreateNotes)}
      >
        {props.fallback}
      </Match>
      <Match when={and(props.workspace === 'manage', !workspace()?.permissions.canManage)}>
        {props.fallback}
      </Match>

      <Match when={authorized()}>{props.children}</Match>
    </Switch>
  );
};

export const PrivateRoute = (props: ParentProps) => (
  <IfAuthenticated fallback={<Navigate href={links.login()} />}>{props.children}</IfAuthenticated>
);
