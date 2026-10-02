import { expect } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('minimal-api/functions');

test.describe('minimal-api/functions', () => {
  let port: number;
  let stopApp: () => Promise<void>;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('calls server functions from client components', async ({ page }) => {
    await page.goto(`http://localhost:${port}/`);
    await waitForHydration(page);
    await page.getByRole('button', { name: 'Click to greet' }).click();
    await expect(
      page.getByRole('button', { name: 'Hello c=0 from server!' }),
    ).toBeVisible();
    const serverCounter = page.getByText(/^Server counter: \d+$/);
    const before = Number((await serverCounter.textContent())!.split(': ')[1]);
    await page
      .getByRole('button', { name: 'Increment server counter' })
      .click();
    await expect(serverCounter).toHaveText(`Server counter: ${before + 1}`);
  });

  test('passes bound arguments to a server function', async ({ page }) => {
    await page.goto(`http://localhost:${port}/`);
    await waitForHydration(page);
    await page.getByRole('textbox').fill('waku');
    await expect(page.getByText('WAKU', { exact: true })).toBeVisible();
    const response = page.waitForResponse(
      (res) =>
        res.url().includes('/RSC/F/') && res.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Hello to the server' }).click();
    expect((await response).status()).toBe(200);
  });
});
