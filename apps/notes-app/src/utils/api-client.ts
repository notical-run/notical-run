import { makeApiClient } from '@notical/api/src/client';
import type { ClientResponse } from 'hono/client';
import { API_BASE_URL } from '../settings';

export const getSessionId = () => localStorage.getItem('session-id') ?? '';

export const setSessionId = (s: string) => localStorage.setItem('session-id', s);

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
  public status: number;
  public handled: boolean = false;
  constructor(
    public readonly response: Response,
    errorMessage?: string | null,
  ) {
    super(errorMessage ?? response.statusText ?? 'Something went wrong');
    this.status = response.status ?? 500;
  }
}

export const toApiErrorMessage = (e?: any): string | null => {
  if (!e) return null;
  if (typeof e === 'string') return e;
  if (typeof e.message === 'string') return e.message;
  if (e.name === 'ZodError' && e.issues)
    return `Invalid values given ${e.issues.map?.((i: any) => i.path.join('.')).join(', ') ?? ''}`;
  return null;
};

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
    const result: any = await response.json().catch(error => ({ error }));
    const errorMessage = toApiErrorMessage(result?.error);
    return Promise.reject(new ApiError(response, errorMessage));
  }

  const result: any = await response.json();
  if (result.success === false || result.error) {
    return Promise.reject(new ApiError(response, result.error));
  }

  return result;
};
