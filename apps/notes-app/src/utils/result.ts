export type Result<E, T> =
  | { type: 'ok'; value: T }
  | { type: 'error'; error: E };

export const Result = {
  ok: <E, T>(value: T): Result<E, T> => ({ type: 'ok', value }),
  err: <E, T>(error: E): Result<E, T> => ({
    type: 'error',
    error,
  }),
  isOk: <E, T>(result: Result<E, T>): result is { type: 'ok'; value: T } =>
    result.type === 'ok',
  isErr: <E, T>(result: Result<E, T>): result is { type: 'error'; error: E } =>
    result.type === 'error',
};
