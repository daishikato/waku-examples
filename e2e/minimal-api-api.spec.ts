import { expect } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('minimal-api/api');

test.describe('minimal-api/api', () => {
  let port: number;
  let stopApp: () => Promise<void>;
  const url = (path: string) => `http://localhost:${port}${path}`;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('fetches the API route from a client component', async ({ page }) => {
    await page.goto(url('/'));
    await waitForHydration(page);
    await expect(
      page.getByRole('heading', { name: 'Hello Waku!!' }),
    ).toBeVisible();
    await expect(page.getByText('Hello, world')).toBeVisible();
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByText('Count: 1')).toBeVisible();
  });

  test('serves the API route', async ({ request }) => {
    const res = await request.get(url('/api/hello'));
    expect(res.status()).toBe(200);
    expect(await res.text()).toBe('world');
  });
});
