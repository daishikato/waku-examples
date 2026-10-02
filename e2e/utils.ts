import { exec, spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { rmSync } from 'node:fs';
import { createConnection, createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { info } from '@actions/core';
import { test as basicTest } from '@playwright/test';
import type { ConsoleMessage, Page } from '@playwright/test';

const execAsync = promisify(exec);

export type TestOptions = {
  mode: 'DEV' | 'PRD';
  page: Page;
};

export const getAvailablePort = async (): Promise<number> => {
  // Start above 10080 to avoid browser-unsafe ports (e.g. 6665-6669, 10080)
  // that Chromium/Firefox refuse to connect to with ERR_UNSAFE_PORT.
  const MIN_PORT = 10100;
  const MAX_PORT = 60000;
  const port = MIN_PORT + Math.floor(Math.random() * (MAX_PORT - MIN_PORT));
  return new Promise((resolve) => {
    const server = createServer();
    server.unref();
    server.on('error', () => {
      server.close(() => resolve(getAvailablePort()));
    });
    server.listen(port, () => {
      server.close(() => resolve(port));
    });
  });
};

const PORT_WAIT_TIMEOUT_MS = 30_000;

export const waitForPortReady = async (port: number): Promise<void> =>
  new Promise((resolve, reject) => {
    const start = Date.now();
    const tryConnect = () => {
      const socket = createConnection(port);
      socket.once('connect', () => {
        socket.end();
        resolve();
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - start >= PORT_WAIT_TIMEOUT_MS) {
          reject(new Error(`Timeout while waiting for port ${port}`));
          return;
        }
        setTimeout(tryConnect, 200);
      });
    };
    tryConnect();
  });

export const runShell = (
  command: string,
  cwd: string,
  env?: Record<string, string>,
): ChildProcess =>
  spawn(command, {
    cwd,
    shell: true,
    detached: process.platform !== 'win32',
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, ...env },
  });

export const terminate = async (cp: ChildProcess): Promise<void> => {
  if (cp.exitCode !== null) {
    return;
  }
  if (process.platform === 'win32') {
    await execAsync(`taskkill /pid ${cp.pid} /t /f`);
  } else if (cp.pid) {
    process.kill(-cp.pid, 'SIGTERM');
  }
};

const unexpectedErrors: RegExp[] = [
  /^You did not run Node.js with the `--conditions react-server` flag/,
  /^Warning: Expected server HTML to contain a matching/,
];

// Expected errors that some examples log on purpose (error boundaries, 404s,
// redirects, etc.). They are left out of the logged server output.
export const ignoreErrors: RegExp[] = [
  /ExperimentalWarning: Custom ESM Loaders is an experimental feature and might change at any time/,
  /npm warn Unknown env config "verify-deps-before-run"\./,
  /^(Error during rendering: )?Error: Unexpected error\s+at ThrowsComponent/,
  /^(Error during rendering: )?Error: Intentional render error\s+at ErrorRender/,
  /^Error: Input is required\b/,
  /^(Error during rendering: )?Error: 401 Unauthorized\s+at CheckIfAccessDenied/,
  /^(Error during rendering: )?Error: Not Found\s+at (Sync|Async)Page/,
  /^(Error during rendering: )?Error: Not Found\s+at info/,
  /^(Error during rendering: )?Error: Not Found\s+at createCustomError/,
  /^(Error during rendering: )?Error: Redirect\s+at info/,
  /^(Error during rendering: )?Error: Redirect\s+at createCustomError/,
  /^(Error during rendering: )?\[Error: An error occurred in the Server Components render\./,
  /^Error: pathname must start with basePath: \/favicon\.ico\s+at removeBase/,
];

export const test = basicTest.extend<
  Omit<TestOptions, 'mode'>,
  Pick<TestOptions, 'mode'>
>({
  mode: ['DEV', { option: true, scope: 'worker' }],
  page: async ({ page }, pageUse, testInfo) => {
    const callback = (msg: ConsoleMessage) => {
      if (unexpectedErrors.some((re) => re.test(msg.text()))) {
        throw new Error(msg.text());
      }
      console.log(`(${testInfo.title}) ${msg.type()}: ${msg.text()}`);
    };
    page.on('console', callback);
    await pageUse(page);
    page.off('console', callback);
  },
});

const logServerOutput = (cp: ChildProcess) => {
  for (const [name, stream] of [
    ['stdout', cp.stdout],
    ['stderr', cp.stderr],
  ] as const) {
    stream?.on('data', (data) => {
      if (!ignoreErrors.some((re) => re.test(`${data}`))) {
        info(`${name}: ${data}`);
      }
    });
  }
};

export const prepareExample = (
  example: string,
  { env }: { env?: Record<string, string> } = {},
) => {
  const cwd = fileURLToPath(new URL(`../${example}`, import.meta.url));
  let built = false;
  return async (mode: TestOptions['mode']) => {
    if (mode === 'PRD' && !built) {
      rmSync(`${cwd}/dist`, { recursive: true, force: true });
      await execAsync('pnpm --silent run build', {
        cwd,
        env: { ...process.env, ...env },
      });
      built = true;
    }
    const port = await getAvailablePort();
    const script = mode === 'DEV' ? 'dev' : 'start';
    const cp = runShell(`pnpm --silent run ${script} --port ${port}`, cwd, env);
    logServerOutput(cp);
    await waitForPortReady(port);
    return { port, stopApp: () => terminate(cp) };
  };
};

export const waitForHydration = async (page: Page) => {
  await page.waitForFunction(() =>
    Object.keys(document.body).some((key) => key.startsWith('__reactFiber')),
  );
};
