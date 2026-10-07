import { expect } from '@playwright/test';
import { prepareExample, test } from './utils.js';

const startApp = prepareExample('fs-router/tanstack-router');

test.describe('fs-router/tanstack-router', () => {
  let port: number;
  let stopApp: () => Promise<void>;
  const url = (path: string) => `http://localhost:${port}${path}`;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('routes on the client with TanStack Router', async ({ page }) => {
    await page.goto(url('/'));
    await expect(
      page.getByRole('heading', { name: 'Welcome Home!' }),
    ).toBeVisible();
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page.getByText('Hello from About!')).toBeVisible();
    await expect(page).toHaveURL(url('/about'));
    await page.goBack();
    await expect(
      page.getByRole('heading', { name: 'Welcome Home!' }),
    ).toBeVisible();
    await expect(page).toHaveURL(url('/'));
  });

  test('serves the app for any path', async ({ page }) => {
    const res = await page.goto(url('/about'));
    expect(res?.status()).toBe(200);
    await expect(page.getByText('Hello from About!')).toBeVisible();
  });

  test('calls a server function', async ({ page }) => {
    await page.goto(url('/'));
    await expect(
      page.getByRole('heading', { name: 'Welcome Home!' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Get Server Time' }).click();
    await expect(
      page.getByText(/^Server Time: \d{4}-\d{2}-\d{2}T[\d:.]+Z$/),
    ).toBeVisible();
  });
});
