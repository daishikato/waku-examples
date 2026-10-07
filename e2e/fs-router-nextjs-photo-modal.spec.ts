import { expect } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('fs-router/nextjs-photo-modal');

test.describe('fs-router/nextjs-photo-modal', () => {
  let port: number;
  let stopApp: () => Promise<void>;
  const url = (path: string) => `http://localhost:${port}${path}`;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('opens a photo from the feed in a modal', async ({ page }) => {
    await page.goto(url('/'));
    await waitForHydration(page);
    await expect(page).toHaveTitle('NextGram');
    const feed = page.locator('.feed');
    await feed.evaluate((element) => element.setAttribute('data-kept', ''));
    await page.getByRole('link', { name: '2', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.locator('figure')).toHaveText('2');
    await expect(page).toHaveURL(url('/photos/2'));
    await expect(page.locator('.feed[data-kept]')).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL(url('/'));
    await page.getByRole('link', { name: '5', exact: true }).click();
    await expect(dialog.locator('figure')).toHaveText('5');
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL(url('/'));
  });

  test('renders a standalone page when loaded directly', async ({ page }) => {
    await page.goto(url('/photos/3'));
    await waitForHydration(page);
    await expect(page.locator('[data-standalone]')).toHaveText('3');
    await expect(page.locator('.feed')).toBeHidden();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('renders a standalone page on reload with the modal open', async ({
    page,
  }) => {
    await page.goto(url('/'));
    await waitForHydration(page);
    await page.getByRole('link', { name: '4', exact: true }).click();
    await expect(page.getByRole('dialog').locator('figure')).toHaveText('4');
    await page.reload();
    await waitForHydration(page);
    await expect(page.locator('[data-standalone]')).toHaveText('4');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('answers a photo outside the static paths with 404', async ({
    request,
  }) => {
    expect((await request.get(url('/photos/7'))).status()).toBe(404);
  });
});
