import { hc } from 'hono/client';
import type { RouteType } from '.';

export const makeApiClient: typeof hc<RouteType> = (apiUrl, opts) => hc<RouteType>(apiUrl, opts);
