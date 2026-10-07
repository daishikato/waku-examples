import { expect } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('minimal-api/islands');

test.describe('minimal-api/islands', () => {
  let port: number;
  let stopApp: () => Promise<void>;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('fetches the dynamic island into the static page', async ({ page }) => {
    await page.goto(`http://localhost:${port}/`);
    await waitForHydration(page);
    await expect(
      page.getByText('This is a static server component.'),
    ).toBeVisible();
    await expect(
      page.getByText('This is a dynamic server component.'),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'My Counter' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByText('Count: 1')).toBeVisible();
  });

  test('renders the island per request and the page once in PRD', async ({
    page,
    mode,
  }) => {
    const timestamps = page.getByText(/^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/);
    await page.goto(`http://localhost:${port}/`);
    await expect(timestamps).toHaveCount(2);
    const [island, shell] = await timestamps.allTextContents();
    await page.reload();
    await expect(timestamps).toHaveCount(2);
    await expect(timestamps.first()).not.toHaveText(island!);
    if (mode === 'PRD') {
      await expect(timestamps.last()).toHaveText(shell!);
    }
  });
});
