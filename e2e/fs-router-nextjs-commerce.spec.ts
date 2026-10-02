import { expect } from '@playwright/test';
import type { BrowserContext } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('fs-router/nextjs-commerce');

test.describe('fs-router/nextjs-commerce', () => {
  let port: number;
  let stopApp: () => Promise<void>;
  const url = (path: string) => `http://localhost:${port}${path}`;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  const skipWelcome = (context: BrowserContext) =>
    context.addCookies([{ name: 'welcome-toast', value: '2', url: url('/') }]);

  test('welcomes a first visit once', async ({ page, context }) => {
    await page.goto(url('/'));
    await waitForHydration(page);
    await expect(page).toHaveTitle('Acme Store');
    const toast = page.getByText('🛍️ Welcome to Next.js Commerce!');
    await expect(toast).toBeVisible();
    await page.getByRole('button', { name: 'Close toast' }).click();
    await expect(toast).toBeHidden();
    expect(await context.cookies()).toContainEqual(
      expect.objectContaining({ name: 'welcome-toast', value: '2' }),
    );
  });

  test('searches the catalogue and browses a collection', async ({
    page,
    context,
  }) => {
    await skipWelcome(context);
    await page.goto(url('/'));
    await waitForHydration(page);
    await expect(
      page.locator('a[href="/product/acme-hoodie"]').first(),
    ).toBeVisible();
    const search = page.locator('input[name="q"]').filter({ visible: true });
    await search.fill('mug');
    await search.press('Enter');
    await expect(page).toHaveURL(url('/search?q=mug'));
    await expect(page.getByText('Showing 1 result for "mug"')).toBeVisible();
    await page.getByRole('link', { name: 'Accessories' }).first().click();
    await expect(page).toHaveURL(url('/search/accessories'));
    await expect(page.locator('a[href="/product/acme-mug"]')).toBeVisible();
    await expect(page.locator('a[href="/product/acme-hoodie"]')).toHaveCount(0);
  });

  test('keeps a cart across page loads', async ({ page, context }) => {
    await skipWelcome(context);
    await page.goto(url('/product/acme-cup'));
    await waitForHydration(page);
    await expect(page).toHaveTitle('Acme Cup | Acme Store');
    await expect
      .poll(async () => (await context.cookies()).map(({ name }) => name))
      .toContain('cartId');
    await page.getByRole('button', { name: '16oz' }).click();
    await expect(page).toHaveURL(url('/product/acme-cup?size=16oz'));
    await page.getByRole('button', { name: 'Add to cart' }).click();
    const cart = page.getByRole('dialog');
    await expect(cart.getByText('Acme Cup')).toBeVisible();
    await expect(cart.getByText('16oz')).toBeVisible();
    await page.reload();
    await waitForHydration(page);
    await page.getByRole('button', { name: 'Open cart' }).click();
    await expect(cart.getByText('Acme Cup')).toBeVisible();
    await cart.getByRole('button', { name: 'Remove cart item' }).click();
    await expect(cart.getByText('Your cart is empty.')).toBeVisible();
  });

  test('renders content pages and answers unknown products with 404', async ({
    page,
  }) => {
    await page.goto(url('/about'));
    await expect(page).toHaveTitle('About | Acme Store');
    await expect(page.getByRole('heading', { name: 'About' })).toBeVisible();
    const res = await page.goto(url('/product/no-such-product'));
    expect(res?.status()).toBe(404);
  });

  test('serves robots.txt, the sitemap and Open Graph images', async ({
    request,
  }) => {
    expect(await (await request.get(url('/robots.txt'))).text()).toContain(
      'Sitemap: ',
    );
    expect(await (await request.get(url('/sitemap.xml'))).text()).toContain(
      '/product/acme-cup</loc>',
    );
    const image = await request.get(url('/opengraph-image?product=acme-cup'));
    expect(image.headers()['content-type']).toBe('image/png');
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('serves the metadata of a product', async ({ page }) => {
      await page.goto(url('/product/acme-cup'));
      await expect(page).toHaveTitle('Acme Cup | Acme Store');
      await expect(page.locator('title')).toHaveCount(1);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        'A 12oz ceramic cup. Dishwasher safe, microwave optional.',
      );
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        'content',
        /\/opengraph-image\?product=acme-cup$/,
      );
      const jsonLd = await page
        .locator('script[type="application/ld+json"]')
        .textContent();
      expect(JSON.parse(jsonLd!)).toMatchObject({
        '@type': 'Product',
        name: 'Acme Cup',
      });
    });

    test('keeps hidden products out of search engines', async ({ page }) => {
      await page.goto(url('/product/acme-prototype-tee'));
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        'noindex, nofollow',
      );
    });
  });
});
