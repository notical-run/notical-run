import { createMutation } from '@tanstack/solid-query';
import { apiClient, responseJson } from '../../utils/api-client';

export const useLogin = () =>
  createMutation(() => ({
    mutationFn: (payload: { email: string; password: string }) =>
      apiClient.api.auth.login.$post({ json: payload }).then(responseJson),
  }));

export const useSignup = () =>
  createMutation(() => ({
    mutationFn: (payload: { name: string; email: string; password: string }) =>
      apiClient.api.auth.signup.$post({ json: payload }).then(responseJson),
  }));

export const useLogout = () =>
  createMutation(() => ({
    mutationFn: () => apiClient.api.auth.logout.$post().then(responseJson),
  }));
