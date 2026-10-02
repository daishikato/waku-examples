import { expect } from '@playwright/test';
import { prepareExample, test } from './utils.js';

const startApp = prepareExample('minimal-api/css');

test.describe('minimal-api/css', () => {
  let port: number;
  let stopApp: () => Promise<void>;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('applies global CSS and a CSS module', async ({ page }) => {
    await page.goto(`http://localhost:${port}/`);
    const headings = page.getByRole('heading', { name: 'Hello Waku!!' });
    await expect(headings).toHaveCount(2);
    await expect(headings.first()).toHaveClass('foo bar');
    await expect(headings.first()).toHaveCSS('color', 'rgb(255, 0, 0)');
    await expect(headings.nth(1)).toHaveCSS(
      'background-color',
      'rgb(255, 192, 203)',
    );
    await expect(page.locator('body')).toHaveCSS(
      'background-color',
      'rgb(255, 255, 224)',
    );
    await expect(page.getByText('Hello from server!')).toBeVisible();
  });
});
