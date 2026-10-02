import { expect } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('minimal-api/form');

test.describe('minimal-api/form', () => {
  let port: number;
  let stopApp: () => Promise<void>;
  const url = (path: string) => `http://localhost:${port}${path}`;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('submits forms to server functions', async ({ page }) => {
    await page.goto(url('/'));
    await waitForHydration(page);
    await page.locator('input[name="name"]').first().fill('Alice');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText('Hello Alice from server!')).toBeVisible();
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByText('Count: 1')).toBeVisible();
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByText('Count: 2')).toBeVisible();
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('submits forms as page loads', async ({ page }) => {
      await page.goto(url('/'));
      await page.locator('input[name="name"]').first().fill('Bob');
      await page.getByRole('button', { name: 'Submit' }).click();
      await expect(page.getByText('Hello Bob from server!')).toBeVisible();
      await page.getByRole('button', { name: 'Increment' }).click();
      await expect(page.getByText('Count: 1')).toBeVisible();
    });
  });
});
