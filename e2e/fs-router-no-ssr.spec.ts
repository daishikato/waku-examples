import { expect } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('fs-router/no-ssr');

test.describe('fs-router/no-ssr', () => {
  let port: number;
  let stopApp: () => Promise<void>;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  for (const [path, text] of [
    ['/', 'Hello world!'],
    ['/about', 'The minimal React framework'],
  ] as const) {
    test(`serves ${path} without server rendering`, async ({ request }) => {
      const res = await request.get(`http://localhost:${port}${path}`);
      expect(res.status()).toBe(200);
      expect(await res.text()).not.toContain(text);
    });
  }

  test('renders the home page in the browser', async ({ page }) => {
    await page.goto(`http://localhost:${port}/`);
    await waitForHydration(page);
    await expect(
      page.getByRole('heading', { name: 'Waku', exact: true }),
    ).toBeVisible();
    await expect(page.getByText('Hello world!')).toBeVisible();
    await expect(page).toHaveTitle('Waku');
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByText('Count: 1')).toBeVisible();
  });

  test('navigates to the about page and back', async ({ page }) => {
    await page.goto(`http://localhost:${port}/`);
    await waitForHydration(page);
    await page.getByRole('link', { name: 'About page' }).click();
    await expect(
      page.getByRole('heading', { name: 'About Waku' }),
    ).toBeVisible();
    await expect(page).toHaveURL(`http://localhost:${port}/about`);
    await expect(page).toHaveTitle('About');
    await page.getByRole('link', { name: 'Return home' }).click();
    await expect(page.getByText('Hello world!')).toBeVisible();
  });
});
