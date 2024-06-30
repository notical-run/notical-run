import { hc } from 'hono/client';
import type { RouteType } from './index';

export const makeApiClient = (apiUrl: string) => hc<RouteType>(apiUrl);
