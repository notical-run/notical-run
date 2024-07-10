import { makeApiClient } from '@notical/api/src/client';
import type { ClientResponse } from 'hono/client';
import { API_BASE_URL } from '../settings';

export const getSessionId = () => localStorage.getItem('session-id') ?? '';

export const setSessionId = (s: string) =>
  localStorage.setItem('session-id', s);

const fetchInstance: typeof fetch = (req, reqInit) => {
  const sessionId = getSessionId();
  return fetch(req, {
    ...reqInit,
    headers: {
      ...reqInit?.headers,
      Authorization: sessionId && `Bearer ${sessionId}`,
      'Content-Type': 'application/json',
    },
  });
};

export const apiClient = makeApiClient(API_BASE_URL, {
  fetch: fetchInstance,
});

export class ApiError extends Error {
  constructor(
    public readonly response: Response,
    errorMessage?: string,
  ) {
    super(
      `APIError: ${errorMessage ?? `HTTP ${response.status}: ${response.statusText}`}`,
    );
  }
}

type ResponseOutput<CR extends ClientResponse<unknown>> =
  CR extends ClientResponse<infer Resp, any, 'json'>
    ? Resp extends { error: string }
      ? never
      : Resp
    : never;

export const responseJson = async <
  Resp extends Record<any, any>,
  CR extends ClientResponse<Resp, any, 'json'>,
>(
  response: CR,
): Promise<ResponseOutput<CR>> => {
  if (!response.ok) {
    throw new ApiError(response);
  }

  const result: any = await response.json();
  if (result.success === false || result.error) {
    throw new ApiError(response, result.error || undefined);
  }

  return result;
};
