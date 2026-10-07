import { expect } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('fs-router/basic-js');

test.describe('fs-router/basic-js', () => {
  let port: number;
  let stopApp: () => Promise<void>;
  const url = (path: string) => `http://localhost:${port}${path}`;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('navigates between pages with their metadata', async ({ page }) => {
    await page.goto(url('/'));
    await waitForHydration(page);
    await expect(page).toHaveTitle('Waku');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      'An internet website!',
    );
    const heading = page.getByRole('heading', { name: 'Waku', exact: true });
    await expect(heading).toHaveCSS('font-size', '36px');
    await expect(page.getByText('Hello world!')).toBeVisible();
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByText('Count: 1')).toBeVisible();
    await page.getByRole('link', { name: 'About page' }).click();
    await expect(
      page.getByRole('heading', { name: 'About Waku' }),
    ).toBeVisible();
    await expect(page).toHaveTitle('About');
    await expect(page).toHaveURL(url('/about'));
    await page.getByRole('link', { name: 'Waku starter' }).click();
    await expect(page.getByText('Hello world!')).toBeVisible();
    await expect(page).toHaveURL(url('/'));
  });

  test('redirects a trailing slash unless a prerendered file answers first', async ({
    request,
    mode,
  }) => {
    const res = await request.get(url('/no-such-page/'), { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers()['location']).toBe(url('/no-such-page'));
    const about = await request.get(url('/about/'), { maxRedirects: 0 });
    expect(about.status()).toBe(mode === 'PRD' ? 200 : 301);
  });

  test('serves files from public', async ({ request }) => {
    const icon = await request.get(url('/images/favicon.png'));
    expect(icon.headers()['content-type']).toBe('image/png');
  });

  test('answers an unknown path with 404', async ({ request }) => {
    expect((await request.get(url('/no-such-page'))).status()).toBe(404);
  });
});
