import { expect } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('fs-router/css-modules');

test.describe('fs-router/css-modules', () => {
  let port: number;
  let stopApp: () => Promise<void>;
  const url = (path: string) => `http://localhost:${port}${path}`;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('applies CSS modules of server and client components', async ({
    page,
  }) => {
    await page.goto(url('/'));
    await waitForHydration(page);
    await expect(page).toHaveTitle('Waku');
    await expect(
      page.getByRole('heading', { name: 'Waku', exact: true }),
    ).toHaveCSS('font-size', '36px');
    await expect(page.locator('section')).toHaveCSS(
      'border-top-style',
      'dashed',
    );
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByText('Count: 1')).toBeVisible();
    await page.getByRole('link', { name: 'About page' }).click();
    await expect(page.getByRole('heading', { name: 'About Waku' })).toHaveCSS(
      'font-size',
      '36px',
    );
  });
});
