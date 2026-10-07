import { readFileSync, writeFileSync } from 'node:fs';
import { expect } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('fs-router/form');
const messageFile = new URL(
  '../fs-router/form/private/message.txt',
  import.meta.url,
);

test.describe('fs-router/form', () => {
  let port: number;
  let stopApp: () => Promise<void>;
  let message: string;
  const url = (path: string) => `http://localhost:${port}${path}`;

  test.beforeAll(async ({ mode }) => {
    message = readFileSync(messageFile, 'utf8');
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
    writeFileSync(messageFile, message);
  });

  test('appends to the message from the client form', async ({
    page,
    mode,
  }) => {
    await page.goto(url('/'));
    await waitForHydration(page);
    await expect(page.getByText('Hello from server!')).toBeVisible();
    const form = page.locator('form').filter({ hasText: 'Email:' });
    await form.locator('input[name="name"]').fill(`Alice ${mode}`);
    await form.locator('input[name="email"]').fill('alice@example.com');
    await form.getByRole('button', { name: 'Submit' }).click();
    await expect(
      form.getByRole('button', { name: 'Pending...' }),
    ).toBeDisabled();
    await expect(page.getByText(`Alice ${mode} from server!`)).toBeVisible();
    await expect(form.getByRole('button', { name: 'Submit' })).toBeEnabled();
  });

  test('submits the server form', async ({ page }) => {
    await page.goto(url('/'));
    await waitForHydration(page);
    await page.getByLabel('Full Name').fill('Carol');
    await page.getByLabel('Age').fill('30');
    await page.getByLabel('Favorite Color').selectOption('green');
    await page.getByLabel('Favorite Hobby').fill('Reading');
    await page.getByLabel('Subscribe to newsletter').check();
    const response = page.waitForResponse(
      (res) => res.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Save Profile' }).click();
    expect((await response).status()).toBe(200);
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('appends to the message as a page load', async ({ page, mode }) => {
      await page.goto(url('/'));
      const form = page.locator('form').filter({ hasText: 'Email:' });
      await form.locator('input[name="name"]').fill(`Bob ${mode}`);
      await form.locator('input[name="email"]').fill('bob@example.com');
      await form.getByRole('button', { name: 'Submit' }).click();
      await expect(page.getByText(`Bob ${mode} from server!`)).toBeVisible();
    });
  });
});
