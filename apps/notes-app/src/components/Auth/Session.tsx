import { Navigate } from '@solidjs/router';
import { createSignal, Match, ParentProps, Switch } from 'solid-js';
import { getSessionId, setSessionId } from '../../utils/api-client';
import { links } from '../Navigation';

export const createSessionId = () => {
  const [sessionId, setSid] = createSignal(getSessionId());

  const updateSessionId = (newSessionId: string) => {
    setSid(newSessionId);
    setSessionId(newSessionId);
  };

  return [sessionId, updateSessionId] as const;
};

export const PrivateRoute = (props: ParentProps) => {
  const [sessionId] = createSessionId();
  return (
    <Switch>
      <Match when={sessionId()}>{props.children}</Match>
      <Match when={!sessionId()}>
        <Navigate href={links.login()} />
      </Match>
    </Switch>
  );
};
