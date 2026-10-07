import { expect } from '@playwright/test';
import type { Locator } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('fs-router/data-fetching');

const hrefsOf = (links: Locator) =>
  links.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('href')!),
  );

test.describe('fs-router/data-fetching', () => {
  let port: number;
  let stopApp: () => Promise<void>;
  const url = (path: string) => `http://localhost:${port}${path}`;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('links nine random pokemon to their pages', async ({
    page,
    request,
  }) => {
    await page.goto(url('/'));
    await waitForHydration(page);
    await expect(page).toHaveTitle('Waku pokemon');
    const links = page.getByRole('listitem').getByRole('link');
    await expect(links).toHaveCount(9);
    const hrefs = await hrefsOf(links);
    for (const href of hrefs) {
      const res = await request.get(url(href));
      expect(res.status()).toBe(200);
      expect(await res.text()).toContain('<title>Waku ');
    }
    await page.getByRole('button', { name: 'reload' }).click();
    await expect.poll(() => hrefsOf(links)).not.toEqual(hrefs);
  });

  test('renders a pokemon page and links back', async ({ page }) => {
    await page.goto(url('/bulbasaur'));
    await waitForHydration(page);
    await expect(page).toHaveTitle('Waku Bulbasaur');
    await expect(page.getByText('フシギダネ')).toBeVisible();
    await page.getByRole('link', { name: 'back' }).click();
    await expect(page).toHaveTitle('Waku pokemon');
  });

  test('renders pokemon whose slugs have a hyphen or a space', async ({
    page,
  }) => {
    for (const [path, name] of [
      ['/nidoran-female', 'Nidoran♀'],
      ['/nidoran-male', 'Nidoran♂'],
      ['/mr.-mime', 'Mr. Mime'],
    ]) {
      await page.goto(url(path));
      await expect(page).toHaveTitle(`Waku ${name}`);
    }
  });
});
