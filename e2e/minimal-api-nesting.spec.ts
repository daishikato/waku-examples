import { expect } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('minimal-api/nesting');

test.describe('minimal-api/nesting', () => {
  let port: number;
  let stopApp: () => Promise<void>;
  const url = (path: string) => `http://localhost:${port}${path}`;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('refetches the inner server component with the outer count', async ({
    page,
  }) => {
    await page.goto(url('/'));
    await waitForHydration(page);
    await expect(
      page.getByText('This is another server component.'),
    ).toBeVisible();
    await expect(page.getByText('The outer count is 0.')).toBeVisible();
    await page
      .getByRole('button', { name: 'Increment', exact: true })
      .first()
      .click();
    await expect(page.getByText('The outer count is 1.')).toBeVisible();
    await page
      .getByRole('button', { name: 'Increment with transition' })
      .click();
    await expect(page.getByText('The outer count is 2.')).toBeVisible();
    await expect(page.getByText('Hello from server!')).toBeVisible();
  });

  test('renders a root without SSR', async ({ page }) => {
    await page.goto(url('/no-ssr'));
    await expect(page.getByRole('heading', { name: 'Hello!!' })).toBeVisible();
    await expect(
      page.getByText('This is a server component without SSR.'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByText('Count: 1')).toBeVisible();
  });
});
