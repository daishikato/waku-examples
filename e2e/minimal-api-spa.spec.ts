import { expect } from '@playwright/test';
import { prepareExample, test } from './utils.js';

const startApp = prepareExample('minimal-api/spa');

test.describe('minimal-api/spa', () => {
  let port: number;
  let stopApp: () => Promise<void>;
  const url = (path: string) => `http://localhost:${port}${path}`;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('serves the same shell for every path', async ({ request }) => {
    for (const path of ['/', '/any/path']) {
      const res = await request.get(url(path));
      expect(res.status()).toBe(200);
      expect(await res.text()).not.toContain('Hello Client!!');
    }
  });

  test('renders on the client and calls a server function', async ({
    page,
  }) => {
    await page.goto(url('/'));
    await expect(
      page.getByRole('heading', { name: 'Hello Client!!' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByText('Count: 1')).toBeVisible();
    await page.getByRole('button', { name: 'Greet' }).click();
    await expect(page.getByText(/^Hello from server \(/)).toBeVisible();
  });
});
