import { expect } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('create-pages/view-transitions');

test.describe('create-pages/view-transitions', () => {
  let port: number;
  let stopApp: () => Promise<void>;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('runs a view transition on each navigation', async ({ page }) => {
    await page.addInitScript(() => {
      const startViewTransition = Document.prototype.startViewTransition;
      let count = 0;
      Object.defineProperty(window, 'viewTransitions', { get: () => count });
      Document.prototype.startViewTransition = function (...args) {
        count += 1;
        return startViewTransition.apply(this, args);
      };
    });
    const viewTransitions = () =>
      page.evaluate(
        () =>
          (window as unknown as { viewTransitions: number }).viewTransitions,
      );
    await page.goto(`http://localhost:${port}/`);
    await waitForHydration(page);
    await expect(
      page.getByRole('heading', { name: 'Waku view transitions' }),
    ).toBeVisible();
    await page.getByRole('link', { name: 'About' }).click();
    await expect(
      page.getByRole('heading', { name: 'About Waku' }),
    ).toBeVisible();
    await expect(
      page.getByText(
        'This is the about page with a different background color.',
      ),
    ).toBeVisible();
    await expect.poll(viewTransitions).toBe(1);
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(
      page.getByRole('heading', { name: 'Waku view transitions' }),
    ).toBeVisible();
    await expect.poll(viewTransitions).toBe(2);
  });
});
