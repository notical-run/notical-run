export type Result<E, T> = { type: 'ok'; value: T } | { type: 'error'; error: E };

export const Result = {
  ok: <E, T>(value: T): Result<E, T> => ({
    type: 'ok',
    value,
  }),

  err: <E, T>(error: E): Result<E, T> => ({
    type: 'error',
    error,
  }),

  isOk: <E, T>(result: Result<E, T>): result is Result<E, T> & { type: 'ok' } =>
    result.type === 'ok',

  isErr: <E, T>(result: Result<E, T>): result is Result<E, T> & { type: 'error' } =>
    result.type === 'error',

  asValue: <E, T>(result: Result<E, T>): E => (result as any)?.value,
  asError: <E, T>(result: Result<E, T>): T => (result as any)?.error,
};
