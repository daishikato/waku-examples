import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { expect } from '@playwright/test';
import { test } from './utils.js';

const groups = ['fs-router', 'create-pages', 'define-router', 'minimal-api'];

test('every example has a spec named after its package', () => {
  const missing = groups.flatMap((group) =>
    readdirSync(new URL(`../${group}`, import.meta.url), {
      withFileTypes: true,
    })
      .filter((entry) => entry.isDirectory())
      .map(
        (entry) =>
          JSON.parse(
            readFileSync(
              new URL(
                `../${group}/${entry.name}/package.json`,
                import.meta.url,
              ),
              'utf8',
            ),
          ).name as string,
      )
      .filter(
        (name) => !existsSync(new URL(`./${name}.spec.ts`, import.meta.url)),
      ),
  );
  expect(missing).toEqual([]);
});
