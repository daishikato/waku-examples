import { expect } from '@playwright/test';
import { prepareExample, test, waitForHydration } from './utils.js';

const startApp = prepareExample('fs-router/nextjs-blog-starter', {
  env: { TZ: 'UTC' },
});

test.describe('fs-router/nextjs-blog-starter', () => {
  let port: number;
  let stopApp: () => Promise<void>;
  const url = (path: string) => `http://localhost:${port}${path}`;

  test.beforeAll(async ({ mode }) => {
    ({ port, stopApp } = await startApp(mode));
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('lists the posts and opens one', async ({ page }) => {
    await page.goto(url('/'));
    await waitForHydration(page);
    await expect(page).toHaveTitle('Next.js Blog Example with Markdown');
    await expect(
      page.getByRole('heading', { name: 'Blog.', exact: true }),
    ).toHaveCSS('font-size', '100px');
    await expect(
      page.getByRole('heading', { level: 3 }).getByRole('link'),
    ).toHaveCount(3);
    await page
      .getByRole('heading', { name: 'Dynamic Routing and Static Generation' })
      .getByRole('link')
      .click();
    await expect(page).toHaveURL(url('/posts/dynamic-routing'));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Dynamic Routing and Static Generation',
    );
    await expect(page).toHaveTitle(
      'Dynamic Routing and Static Generation | Next.js Blog Example with Markdown',
    );
    await expect(
      page.getByRole('heading', { name: 'Lorem Ipsum' }),
    ).toBeVisible();
    await page.getByRole('link', { name: 'Blog', exact: true }).click();
    await expect(page).toHaveURL(url('/'));
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('serves one title and description per post', async ({ page }) => {
      await page.goto(url('/posts/hello-world'));
      const title =
        'Learn How to Pre-render Pages Using Static Generation with Next.js | Next.js Blog Example with Markdown';
      await expect(page).toHaveTitle(title);
      await expect(page.locator('title')).toHaveCount(1);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        'A statically generated blog example using Next.js and Markdown.',
      );
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
        'content',
        title,
      );
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        'content',
        '/assets/blog/hello-world/cover.jpg',
      );
      await expect(page.locator('time')).toHaveText('March 16, 2020');
    });
  });

  test('cycles the color scheme and keeps it across loads', async ({
    page,
  }) => {
    await page.goto(url('/'));
    await waitForHydration(page);
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-mode', 'system');
    await page.getByRole('button').click();
    await expect(html).toHaveAttribute('data-mode', 'dark');
    await expect(html).toHaveClass('dark');
    await page.reload();
    await expect(html).toHaveAttribute('data-mode', 'dark');
    await waitForHydration(page);
    await page.getByRole('button').click();
    await expect(html).toHaveAttribute('data-mode', 'light');
    await expect(html).not.toHaveClass('dark');
  });

  test('answers an unknown post with 404', async ({ request }) => {
    expect((await request.get(url('/posts/no-such-post'))).status()).toBe(404);
  });
});
