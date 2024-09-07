export class Just<T> {
  type = 'just' as const;
  constructor(public value: T) {}
  map = <R>(f: (v: T) => R): Just<R> => new Just(f(this.value));
  flatMap = <R>(f: (v: T) => Maybe<R>): Maybe<R> => f(this.value);
  or = <R>(_: () => Maybe<R>): Maybe<T | R> => this;
  isJust = (): this is Just<any> => true;
  isNothing = (): this is Nothing<any> => false;
}

export class Nothing<T> {
  type = 'nothing' as const;
  map = <R>(_f: (v: T) => R): Nothing<R> => new Nothing();
  flatMap = <R>(_f: (v: T) => Maybe<R>): Maybe<R> => new Nothing();
  or = <R>(f: () => Maybe<R>): Maybe<T | R> => f();
  isJust = (): this is Just<any> => false;
  isNothing = (): this is Nothing<any> => true;
}

export type Maybe<T> = Just<T> | Nothing<T>;

export const Maybe = {
  Just: <T>(value: T): Maybe<T> => new Just(value),
  Nothing: <T>(): Maybe<T> => new Nothing(),

  asValue: <T>(m: Maybe<T>): T | undefined => (m as any)?.value,
};
