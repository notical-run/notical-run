import { makeApiClient } from '@notical/api/src/client';
import { API_BASE_URL } from '../settings';

export const apiClient = makeApiClient(API_BASE_URL);
