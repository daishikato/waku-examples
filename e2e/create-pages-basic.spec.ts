import { expect } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('create-pages/basic');

test.describe('create-pages/basic', () => {
  let port: number;
  let stopApp: () => Promise<void>;
  const url = (path: string) => `http://localhost:${port}${path}`;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('navigates between static and dynamic pages', async ({ page }) => {
    await page.goto(url('/'));
    await waitForHydration(page);
    await expect(page).toHaveTitle('Waku');
    await expect(page.getByText('This is the home page.')).toBeVisible();
    await page.locator('a[href="/foo"]').click();
    await expect(
      page.getByRole('heading', { name: 'Foo', exact: true }),
    ).toBeVisible();
    await expect(page.getByText('path: /foo')).toBeVisible();
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByText('Count: 1')).toBeVisible();
    await page.getByRole('link', { name: 'Baz', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Dynamic: Baz' }),
    ).toBeVisible();
    await expect(page).toHaveURL(url('/baz'));
  });

  test('renders nested layouts and static paths', async ({ page }) => {
    await page.goto(url('/nested/qux'));
    await expect(
      page.getByRole('heading', { name: 'Nested Layout' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Qux' })).toBeVisible();
    await page.goto(url('/nested/foo'));
    await expect(
      page.getByRole('heading', { name: 'Deeply Nested Layout' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Static: foo' }),
    ).toBeVisible();
    await page.goto(url('/nested/xyz'));
    await expect(
      page.getByRole('heading', { name: 'Dynamic: xyz' }),
    ).toBeVisible();
  });

  test('renders a new timestamp for each visit to a dynamic page', async ({
    page,
  }) => {
    await page.goto(url('/nested/baz'));
    const first = await page.locator('p').last().textContent();
    expect(first).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    await page.reload();
    await expect(page.locator('p').last()).not.toHaveText(first!);
  });

  test('matches wildcard and catch-all routes', async ({ page }) => {
    await page.goto(url('/wild/hello/world'));
    await expect(
      page.getByRole('heading', { name: 'Slug: hello/world' }),
    ).toBeVisible();
    await page.goto(url('/any/a/b'));
    await expect(
      page.getByRole('heading', { name: 'Catch-all: a/b' }),
    ).toBeVisible();
  });

  test('renders the custom 404 page for an unknown path', async ({ page }) => {
    const res = await page.goto(url('/no-such-page'));
    expect(res?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { name: 'Not Found' }),
    ).toBeVisible();
    await expect(page.locator('a[href="/foo"]')).toBeVisible();
  });

  test('renders a static slice once and a dynamic slice per request', async ({
    page,
  }) => {
    await page.goto(url('/slice-page'));
    const staticSlice = page.getByRole('heading', { name: /^Static Slice / });
    await expect(staticSlice).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /^Dynamic Slice Component / }),
    ).toBeVisible();
    const text = await staticSlice.textContent();
    await page.reload();
    await expect(staticSlice).toHaveText(text!);
  });

  test('jumps to a random page from a server function', async ({ page }) => {
    await page.goto(url('/foo'));
    await waitForHydration(page);
    await page.getByRole('button', { name: 'Jump to random page' }).click();
    await expect(page).not.toHaveURL(url('/foo'));
    const headings: Record<string, string> = {
      '/bar': 'Bar',
      '/baz': 'Dynamic: Baz',
      '/nested/qux': 'Qux',
      '/nested/aaa': 'Dynamic: aaa',
      '/nested/bbb': 'Dynamic: bbb',
    };
    const heading = headings[new URL(page.url()).pathname];
    expect(heading).toBeDefined();
    await expect(
      page.getByRole('heading', { name: heading, exact: true }),
    ).toBeVisible();
  });

  test('serves API routes', async ({ request }) => {
    expect(await (await request.get(url('/api/hi'))).text()).toBe(
      'hello world!',
    );
    expect(
      await (await request.post(url('/api/hi'), { data: 'Waku' })).text(),
    ).toBe('hello Waku!');
    expect(await (await request.get(url('/api/hi.txt'))).text()).toBe(
      'hello from a text file!',
    );
    const empty = await request.get(url('/api/empty'));
    expect(empty.status()).toBe(200);
    expect(await empty.text()).toBe('');
  });
});
