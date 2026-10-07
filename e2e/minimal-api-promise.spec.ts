import { expect } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('minimal-api/promise');

test.describe('minimal-api/promise', () => {
  let port: number;
  let stopApp: () => Promise<void>;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('resolves a server promise in a client component', async ({ page }) => {
    await page.goto(`http://localhost:${port}/`);
    await waitForHydration(page);
    await expect(
      page.getByText('delayedMessage: Hello from server!'),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'A client element' }),
    ).toBeVisible();
    await expect(
      page.getByText('This is a component without "use client".'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByText('Count: 1', { exact: true })).toBeVisible();
    await expect(page.getByText('count: 1', { exact: true })).toBeVisible();
  });
});
