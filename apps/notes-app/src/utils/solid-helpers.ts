import { CreateQueryResult } from '@tanstack/solid-query';

export const and = (...args: any[]) => args.every(Boolean);
export const or = (...args: any[]) => args.some(Boolean);

export type QueryResponseType<T> = T extends CreateQueryResult<infer R> ? R : never;
