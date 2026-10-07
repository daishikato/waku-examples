import { expect } from '@playwright/test';
import { prepareExample, test } from './utils.js';

const startApp = prepareExample('create-pages/react-tweet');

test.describe('create-pages/react-tweet', () => {
  let port: number;
  let stopApp: () => Promise<void>;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  // The tweet is fetched from X's API, which may be unreachable, and then
  // react-tweet renders its "Tweet not found" card in the same container.
  test('renders the embedded tweet card', async ({ page }) => {
    await page.goto(`http://localhost:${port}/`);
    await expect(page).toHaveTitle('Waku');
    await expect(
      page.getByRole('heading', { name: 'Waku', exact: true }),
    ).toBeVisible();
    await expect(page.locator('.react-tweet-theme article')).toBeVisible();
  });
});
