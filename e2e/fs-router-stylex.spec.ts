import { expect } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('fs-router/stylex');

test.describe('fs-router/stylex', () => {
  let port: number;
  let stopApp: () => Promise<void>;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('styles server and client components', async ({ page }) => {
    await page.goto(`http://localhost:${port}/`);
    await waitForHydration(page);
    await expect(page.getByText('Server Style (green)')).toHaveCSS(
      'border-top-color',
      'rgb(0, 128, 0)',
    );
    const button = page.getByRole('button', { name: /^Client Style: / });
    await expect(button).toHaveCSS('border-top-color', 'rgb(255, 165, 0)');
    await button.click();
    await expect(button).toHaveText('Client Style: 1 (orange)');
  });
});
