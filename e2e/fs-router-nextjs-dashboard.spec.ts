import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('fs-router/nextjs-dashboard', {
  env: { SESSION_SECRET: 'e2e-secret-of-at-least-24-characters' },
});

test.describe('fs-router/nextjs-dashboard', () => {
  let port: number;
  let stopApp: () => Promise<void>;
  const url = (path: string) => `http://localhost:${port}${path}`;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  const logIn = async (page: Page, path: string) => {
    await page.goto(url(path));
    await waitForHydration(page);
    await page.getByLabel('Email').fill('user@nextmail.com');
    await page.getByLabel('Password').fill('123456');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(url(path));
  };

  test('keeps signed-out requests away from the data', async ({ request }) => {
    const res = await request.get(url('/dashboard'), { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    expect(res.headers()['location']).toBe('/login?callbackUrl=%2Fdashboard');
    const rsc = await request.get(url('/RSC/R/dashboard/customers.txt'));
    expect(await rsc.text()).not.toContain('Evil Rabbit');
  });

  test('rejects wrong credentials', async ({ page }) => {
    await page.goto(url('/login'));
    await waitForHydration(page);
    await page.getByLabel('Email').fill('user@nextmail.com');
    await page.getByLabel('Password').fill('654321');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByText('Invalid credentials.')).toBeVisible();
    await expect(page).toHaveURL(url('/login'));
  });

  test('logs in, browses the dashboard and signs out', async ({ page }) => {
    await logIn(page, '/dashboard');
    await expect(page).toHaveTitle('Dashboard | Acme Dashboard');
    await expect(
      page.getByRole('heading', { name: 'Latest Invoices' }),
    ).toBeVisible();
    await expect(
      page
        .getByRole('heading', { name: 'Total Customers' })
        .locator('xpath=../..')
        .getByRole('paragraph'),
    ).toHaveText('6');
    await page.getByRole('link', { name: 'Customers' }).click();
    await expect(page.getByText('Evil Rabbit').first()).toBeVisible();
    const rsc = await page.request.get(url('/RSC/R/dashboard/customers.txt'));
    expect(await rsc.text()).toContain('Evil Rabbit');
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page).toHaveURL(url('/'));
    await page.goto(url('/dashboard'));
    await expect(page).toHaveURL(url('/login?callbackUrl=%2Fdashboard'));
  });

  test('searches and pages through invoices', async ({ page }) => {
    await logIn(page, '/dashboard/invoices');
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(6);
    await page.getByRole('link', { name: '3', exact: true }).click();
    await expect(page).toHaveURL(url('/dashboard/invoices?page=3'));
    await expect(rows).toHaveCount(1);
    await page.getByPlaceholder('Search invoices...').fill('Lee');
    await expect(page).toHaveURL(url('/dashboard/invoices?page=1&query=Lee'));
    await expect(rows.first()).toContainText('Lee Robinson');
    for (const row of await rows.all()) {
      await expect(row).toContainText('Lee Robinson');
    }
  });

  test('creates, edits and deletes an invoice', async ({ page }) => {
    await logIn(page, '/dashboard/invoices/create');
    await page.getByRole('button', { name: 'Create Invoice' }).click();
    await expect(
      page.getByText('Missing Fields. Failed to Create Invoice.'),
    ).toBeVisible();
    await page
      .getByLabel('Choose customer')
      .selectOption({ label: 'Amy Burns' });
    await page.getByLabel('Choose an amount').fill('123.45');
    await page.getByLabel('Paid').check();
    await page.getByRole('button', { name: 'Create Invoice' }).click();
    await expect(page).toHaveURL(url('/dashboard/invoices'));
    const created = page.locator('tbody tr', { hasText: '$123.45' });
    await expect(created).toContainText('Amy Burns');
    await created.locator('a[href$="/edit"]').click();
    await expect(page).toHaveTitle('Edit Invoice | Acme Dashboard');
    await page.getByLabel('Choose an amount').fill('678.90');
    await page.getByRole('button', { name: 'Edit Invoice' }).click();
    await expect(page).toHaveURL(url('/dashboard/invoices'));
    const edited = page.locator('tbody tr', { hasText: '$678.90' });
    await expect(edited).toContainText('Amy Burns');
    await edited.getByRole('button', { name: 'Delete' }).click();
    await expect(edited).toHaveCount(0);
  });

  test('renders the 404 page', async ({ page }) => {
    const res = await page.goto(url('/no-such-page'));
    expect(res?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { name: '404 Not Found' }),
    ).toBeVisible();
  });
});
