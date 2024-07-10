import { Navigate } from '@solidjs/router';
import { createSignal, JSX } from 'solid-js';
import { getSessionId, setSessionId } from '../../utils/api-client';

export const createSessionId = () => {
  const [sessionId, setSid] = createSignal(getSessionId());

  const updateSessionId = (newSessionId: string) => {
    setSid(newSessionId);
    setSessionId(newSessionId);
  };

  return [sessionId, updateSessionId] as const;
};

export const PrivateRoute = (C: () => JSX.Element) => () => {
  const [sessionId] = createSessionId();
  if (!sessionId()) return <Navigate href="/login" />;
  return <C />;
};
