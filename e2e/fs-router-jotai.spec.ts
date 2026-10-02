import { expect } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('fs-router/jotai');

test.describe('fs-router/jotai', () => {
  let port: number;
  let stopApp: () => Promise<void>;
  const url = (path: string) => `http://localhost:${port}${path}`;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('renders server components with a client atom', async ({ page }) => {
    await page.goto(url('/'));
    await waitForHydration(page);
    const clientCount = page.locator('section div', {
      hasText: 'Jotai Count:',
    });
    const serverCount = page.locator('p', { hasText: 'Jotai Count:' });
    await expect(clientCount).toHaveText('Jotai Count: 1');
    await expect(serverCount).toHaveText('Jotai Count: 1');
    await page.getByRole('button', { name: 'Jotai Increment' }).click();
    await expect(clientCount).toHaveText('Jotai Count: 2');
    await expect(serverCount).toHaveText('Jotai Count: 2');
    await page.getByRole('button', { name: 'Increment', exact: true }).click();
    await expect(page.getByText('Count: 1', { exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'About page' }).click();
    await expect(
      page.getByRole('heading', { name: 'About Waku' }),
    ).toBeVisible();
    await page.getByRole('link', { name: 'Return home' }).click();
    await expect(serverCount).toHaveText('Jotai Count: 2');
  });
});
