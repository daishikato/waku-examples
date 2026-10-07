import { expect } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('fs-router/features');

test.describe('fs-router/features', () => {
  let port: number;
  let stopApp: () => Promise<void>;
  const url = (path: string) => `http://localhost:${port}${path}`;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('navigates between pages in shared layouts', async ({ page }) => {
    await page.goto(url('/'));
    await waitForHydration(page);
    await expect(page).toHaveTitle('Waku');
    await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible();
    await page.getByRole('link', { name: /^Foo/ }).click();
    await expect(page.getByRole('heading', { name: 'Foo' })).toBeVisible();
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByText('Count: 1')).toBeVisible();
    await page.getByRole('link', { name: /^Nested \/ Baz/ }).click();
    await expect(
      page.getByRole('heading', { name: 'Nested Layout' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Nested / baz' }),
    ).toBeVisible();
    await page.getByRole('link', { name: /^Nested \/ Qux/ }).click();
    await expect(
      page.getByRole('heading', { name: 'Nested / qux' }),
    ).toBeVisible();
    await page.getByRole('link', { name: /^Bar/ }).click();
    await page.getByRole('link', { name: 'Go to Home' }).click();
    await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible();
    await expect(page).toHaveURL(url('/'));
  });

  test('shows a pending indicator while navigating', async ({ page }) => {
    await page.goto(url('/'));
    await waitForHydration(page);
    await page.route(/\/RSC\/R\/foo\.txt/, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });
    const link = page.getByRole('link', { name: /^Foo/ });
    const pending = link.getByText('Pending...');
    await expect(pending).toHaveCSS('opacity', '0');
    await link.click();
    await expect(pending).toHaveCSS('opacity', '1');
    await expect(page.getByRole('heading', { name: 'Foo' })).toBeVisible();
    await expect(pending).toHaveCSS('opacity', '0');
  });

  test('prefetches a link on pointer enter', async ({ page }) => {
    await page.goto(url('/'));
    await waitForHydration(page);
    const prefetch = page.waitForRequest(/\/RSC\/R\/bar\.txt/);
    await page.getByRole('link', { name: /^Bar/ }).hover();
    await prefetch;
  });

  test('renders the dynamic root per request', async ({ page }) => {
    const values = new Set<string | null>();
    for (let i = 0; i < 5; i++) {
      await page.goto(url('/'));
      values.add(await page.locator('body').getAttribute('data-dynamic-root'));
    }
    expect([...values][0]).toMatch(/^Random Number \d+$/);
    expect(values.size).toBeGreaterThan(1);
  });

  test('renders a static slice once and a dynamic slice per request', async ({
    page,
  }) => {
    await page.goto(url('/slice-page'));
    await expect(page.getByText('Children=Hello from SlicePage')).toBeVisible();
    const one = page.getByRole('heading', { name: /^Slice One / });
    const two = page.getByRole('heading', { name: /^Slice Two / });
    const oneText = await one.textContent();
    const twoText = await two.textContent();
    await expect
      .poll(async () => {
        await page.reload();
        return two.textContent();
      })
      .not.toBe(twoText);
    await expect(one).toHaveText(oneText!);
  });

  test('lists the router configs on the debug page', async ({ page }) => {
    await page.goto(url('/debug'));
    await expect(page.getByText(/^Server delay complete at /)).toBeVisible();
    await expect(page.locator('pre')).toContainText(
      '"sourceFile": "pages/debug.tsx"',
    );
  });

  test('serves API routes', async ({ request }) => {
    expect(await (await request.get(url('/hello'))).text()).toBe(
      'Hello from API!',
    );
    expect(await (await request.post(url('/hello'))).text()).toBe(
      'Hello from API! /hello',
    );
    expect(await (await request.get(url('/users/42'))).json()).toEqual({
      id: '42',
      message: 'Hello user 42',
    });
  });
});
