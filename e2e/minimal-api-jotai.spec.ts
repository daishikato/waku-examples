import { expect } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('minimal-api/jotai');

test.describe('minimal-api/jotai', () => {
  let port: number;
  let stopApp: () => Promise<void>;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('rerenders the server atom when the client atom changes', async ({
    page,
  }) => {
    await page.goto(`http://localhost:${port}/`);
    await waitForHydration(page);
    await expect(page.getByText('Count: 1')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '(doubleCount=2)' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByText('Count: 2')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '(doubleCount=4)' }),
    ).toBeVisible();
  });
});
