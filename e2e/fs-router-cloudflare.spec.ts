import { expect } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('fs-router/cloudflare');

test.describe('fs-router/cloudflare', () => {
  let port: number;
  let stopApp: () => Promise<void>;
  const url = (path: string) => `http://localhost:${port}${path}`;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('renders a dynamic page with an environment variable', async ({
    page,
  }) => {
    await page.goto(url('/'));
    await waitForHydration(page);
    await expect(page).toHaveTitle('Waku');
    await expect(page.getByText('MAX_ITEMS = 10.')).toBeVisible();
    await expect(page.getByText('Hello from server!')).toBeVisible();
    const increment = page.getByRole('button', { name: 'Increment' });
    for (let i = 0; i < 11; i++) {
      await increment.click();
    }
    await expect(page.getByText('Count: 10')).toBeVisible();
    await page.getByRole('link', { name: 'About page' }).click();
    await expect(
      page.getByRole('heading', { name: 'About Waku' }),
    ).toBeVisible();
    await expect(page).toHaveTitle('About');
  });

  test('serves the static 404 page', async ({ request }) => {
    const res = await request.get(url('/no-such-page'));
    expect(res.status()).toBe(404);
    expect(await res.text()).toContain('<h1>Not Found</h1>');
  });

  test('serves built assets as wrangler.jsonc and _headers configure', async ({
    request,
    mode,
  }) => {
    test.skip(mode === 'DEV', 'Vite serves the assets in DEV');
    const rsc = await request.get(url('/RSC/R/about.txt'));
    expect(rsc.headers()['x-robots-tag']).toBe('noindex');
    const html = await (await request.get(url('/about'))).text();
    const asset = await request.get(url(html.match(/\/assets\/[^"]+/)![0]));
    expect(asset.headers()['cache-control']).toBe(
      'public, max-age=31536000, immutable',
    );
    const slash = await request.get(url('/about/'), { maxRedirects: 0 });
    expect(slash.status()).toBe(307);
    expect(slash.headers()['location']).toBe('/about');
  });
});
