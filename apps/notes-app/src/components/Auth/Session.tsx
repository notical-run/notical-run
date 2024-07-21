import { Navigate } from '@solidjs/router';
import { createSignal, JSX, Match, ParentProps, Switch } from 'solid-js';
import { getSessionId, setSessionId } from '../../utils/api-client';
import { links } from '../Navigation';

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
    <Switch>
      <Match when={sessionId()}>{props.children}</Match>
      <Match when={!sessionId()}>{props.fallback}</Match>
    </Switch>
  );
};

export const PrivateRoute = (props: ParentProps) => (
  <IfAuthenticated fallback={<Navigate href={links.login()} />}>{props.children}</IfAuthenticated>
);
