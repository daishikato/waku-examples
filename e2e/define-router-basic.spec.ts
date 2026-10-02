import { expect } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('define-router/basic');

test.describe('define-router/basic', () => {
  let port: number;
  let stopApp: () => Promise<void>;
  const url = (path: string) => `http://localhost:${port}${path}`;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('navigates between the static routes', async ({ page }) => {
    await page.goto(url('/'));
    await waitForHydration(page);
    await expect(page).toHaveTitle('Waku');
    await expect(page.getByText('This is the home page.')).toBeVisible();
    await page.locator('a[href="/foo"]').click();
    await expect(
      page.getByRole('heading', { name: 'Foo', exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByText('Count: 1')).toBeVisible();
    await page.getByRole('link', { name: 'Bar', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Bar', exact: true }),
    ).toBeVisible();
    await page.getByRole('link', { name: 'Nested / Baz' }).click();
    await expect(
      page.getByRole('heading', { name: 'Baz', exact: true }),
    ).toBeVisible();
  });

  test('renders the dynamic route for each visited path', async ({ page }) => {
    await page.goto(url('/dynamic/foo'));
    await waitForHydration(page);
    await expect(
      page.getByRole('heading', { name: '/dynamic/foo' }),
    ).toBeVisible();
    await page.getByRole('link', { name: 'Dynamic / bar' }).click();
    await expect(
      page.getByRole('heading', { name: '/dynamic/bar' }),
    ).toBeVisible();
    await page.getByRole('link', { name: 'Dynamic / foo' }).click();
    await expect(page).toHaveURL(url('/dynamic/foo'));
    await expect(
      page.getByRole('heading', { name: '/dynamic/foo' }),
    ).toBeVisible();
  });

  test('serves API routes', async ({ request }) => {
    expect(await (await request.get(url('/api/hi'))).text()).toBe(
      'hello world!',
    );
    expect(await (await request.get(url('/api/hi.txt'))).text()).toBe(
      'hello from a text file!\n',
    );
    const empty = await request.get(url('/api/empty'));
    expect(empty.status()).toBe(200);
    expect(await empty.text()).toBe('');
  });
});
