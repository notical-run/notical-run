import { Page } from '@playwright/test';
import { factory } from './db';

export const loginAsUser = async (
  page: Page,
  email: string = 'e2e-default-user@email.com',
  password: string = '123123123',
) => {
  const user = await factory.createUser({ email, password });

  await page.goto('/login');

  const response = await page.request.post(`${import.meta.env.API_BASE_URL}/api/auth/login`, {
    data: { email, password },
  });

  let responseJson: any;
  const responseBody = await response.text();
  try {
    responseJson = JSON.parse(responseBody);
    if (!responseJson.sessionId) throw new Error('No session id in response');
  } catch (e) {
    throw new Error(`Invalid response from login: ${responseBody}`);
  }

  await page.evaluate(
    (sessionId: string) => localStorage.setItem('session-id', sessionId),
    responseJson.sessionId,
  );

  return user;
};
