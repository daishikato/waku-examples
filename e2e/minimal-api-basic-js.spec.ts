import { expect } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('minimal-api/basic-js');

test.describe('minimal-api/basic-js', () => {
  let port: number;
  let stopApp: () => Promise<void>;
  const url = (path: string) => `http://localhost:${port}${path}`;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('renders server and client components', async ({ page }) => {
    await page.goto(url('/'));
    await waitForHydration(page);
    await expect(page).toHaveTitle('Waku');
    await expect(
      page.getByRole('heading', { name: 'Hello Waku!!' }),
    ).toBeVisible();
    await expect(page.getByText('This is a server component.')).toBeVisible();
    await expect(page.getByText('Hello from server!')).toBeVisible();
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByText('Count: 1')).toBeVisible();
  });

  test('renders per request in DEV and once at build time in PRD', async ({
    page,
    mode,
  }) => {
    const timestamp = page.getByText(/^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/);
    await page.goto(url('/'));
    const first = await timestamp.textContent();
    await page.reload();
    if (mode === 'PRD') {
      await expect(timestamp).toHaveText(first!);
    } else {
      await expect(timestamp).not.toHaveText(first!);
    }
  });

  test('serves the custom 404 page', async ({ page }) => {
    const res = await page.goto(url('/no-such-page'));
    expect(res?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { name: 'Custom Not Found Page' }),
    ).toBeVisible();
  });
});
