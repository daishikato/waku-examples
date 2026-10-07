import { expect } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('create-pages/weave-render');

test.describe('create-pages/weave-render', () => {
  let port: number;
  let stopApp: () => Promise<void>;
  const url = (path: string) => `http://localhost:${port}${path}`;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('keeps the static home layout across pages', async ({ page }) => {
    await page.goto(url('/'));
    await waitForHydration(page);
    const renderTime = page.getByText(/^Last render time: /);
    const text = await renderTime.textContent();
    await expect(
      page.getByRole('heading', { name: 'Home', exact: true }),
    ).toBeVisible();
    await page.locator('a[href="/foo"]').first().click();
    await expect(
      page.getByRole('heading', { name: 'FOO layout' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Foo', exact: true }),
    ).toBeVisible();
    await expect(renderTime).toHaveText(text!);
    await page.locator('a[href="/bar"]').click();
    await expect(
      page.getByText('This Layout is expected to be static'),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Bar', exact: true }),
    ).toBeVisible();
    await expect(renderTime).toHaveText(text!);
    await page.reload();
    await expect(renderTime).toHaveText(text!);
  });

  test('runs the client component in a dynamic page', async ({ page }) => {
    await page.goto(url('/foo'));
    await waitForHydration(page);
    await expect(page.getByText('path: /foo')).toBeVisible();
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByText('Count: 1')).toBeVisible();
  });
});
