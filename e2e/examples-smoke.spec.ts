/**
 * Smoke tests for all examples.
 *
 * Boots every example in both DEV and PRD modes and checks that the home page
 * renders with a "Waku" title, or the one listed in `expectedTitles`. Examples
 * are discovered by scanning the API group directories at the repo root.
 */
import type { ChildProcess } from 'node:child_process';
import { exec } from 'node:child_process';
import { readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { info } from '@actions/core';
import { expect } from '@playwright/test';
import {
  getAvailablePort,
  ignoreErrors,
  runShell,
  terminate,
  test,
  waitForPortReady,
} from './utils.js';

const execAsync = promisify(exec);

const groups = ['fs-router', 'create-pages', 'define-router', 'minimal-api'];

const examples = groups.flatMap((group) => {
  const groupDir = fileURLToPath(new URL(`../${group}`, import.meta.url));
  return readdirSync(groupDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      name: `${group}/${entry.name}`,
      cwd: join(groupDir, entry.name),
    }));
});

// The Next.js migrations keep the titles of the apps they were migrated from.
const expectedTitles: Record<string, RegExp> = {
  'fs-router/nextjs-blog-starter': /^Next\.js Blog Example/,
  'fs-router/nextjs-commerce': /^Acme Store/,
  'fs-router/nextjs-dashboard': /^Acme Dashboard/,
  'fs-router/nextjs-photo-modal': /^NextGram/,
};

const modes = ['DEV', 'PRD'] as const;

test.describe.configure({ mode: 'parallel' });

for (const { name, cwd } of examples) {
  test.describe.serial(`smoke test on ${name}`, () => {
    for (const commandMode of modes) {
      // Each example's own scripts are used: `dev` for DEV, `build` + `start`
      // for PRD. `start` is `waku start` for most examples and `wrangler dev`
      // for the Cloudflare example; both accept `--port`.
      const script = commandMode === 'DEV' ? 'dev' : 'start';

      test.describe(`smoke test in ${commandMode}`, () => {
        test.skip(({ mode }) => mode !== commandMode);

        let port: number;
        let cp: ChildProcess;

        test.beforeAll(async () => {
          if (commandMode === 'PRD') {
            rmSync(`${cwd}/dist`, { recursive: true, force: true });
            await execAsync('pnpm --silent run build', { cwd });
          }
          port = await getAvailablePort();
          // `--silent` suppresses pnpm's own output (the `$ <command>` echo and
          // lifecycle messages); the example's stdout/stderr still pass through.
          cp = runShell(`pnpm --silent run ${script} --port ${port}`, cwd);
          cp.stdout?.on('data', (data) => {
            if (ignoreErrors.some((re) => re.test(`${data}`))) {
              return;
            }
            info(`stdout: ${data}`);
          });
          cp.stderr?.on('data', (data) => {
            if (ignoreErrors.some((re) => re.test(`${data}`))) {
              return;
            }
            // Logged, not raised: tools warn on stderr (e.g. wrangler config
            // notices) and the title assertion is what determines pass/fail.
            info(`stderr: ${data}`);
          });
          await waitForPortReady(port);
        });

        test.afterAll(async () => {
          if (cp) {
            await terminate(cp);
          }
        });

        test('check title', async ({ page }) => {
          await page.goto(`http://localhost:${port}/`);
          // title may not be ready yet
          await page.waitForLoadState('load');
          await expect
            .poll(() => page.title())
            .toMatch(expectedTitles[name] ?? /^Waku/);
        });
      });
    }
  });
}
