import { expect } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('minimal-api/cookies');

test.describe('minimal-api/cookies', () => {
  let port: number;
  let stopApp: () => Promise<void>;
  const url = (path: string) => `http://localhost:${port}${path}`;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('counts requests in a cookie', async ({ page }) => {
    const res = await page.goto(url('/'));
    expect(await res?.headerValue('set-cookie')).toContain('count=1');
    await waitForHydration(page);
    await expect(page.getByText('Cookie count: 1')).toBeVisible();
    await expect(page.getByText('Item count: 10')).toBeVisible();
    await page.reload();
    await expect(page.getByText('Cookie count: 2')).toBeVisible();
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByText('Count: 1', { exact: true })).toBeVisible();
  });

  test('reads the cookie sent with the request', async ({ request }) => {
    const res = await request.get(url('/'), {
      headers: { cookie: 'count=5' },
    });
    expect(res.headers()['set-cookie']).toContain('count=6');
    expect(await res.text()).toMatch(/Cookie count: (<!-- -->)?6/);
  });
});
