import { readFile } from 'node:fs/promises';
import type { ReactNode } from 'react';
import adapter from 'waku/adapters/default';
import {
  Children_UNSTABLE as Children,
  Slot_UNSTABLE as Slot,
} from 'waku/minimal/client';
import { unstable_defineRouter as defineRouter } from 'waku/router/server';
import BarPage from './components/BarPage';
import FooPage from './components/FooPage';
import HomeLayout from './components/HomeLayout';
import HomePage from './components/HomePage';
import NestedBazPage from './components/NestedBazPage';
import Root from './components/Root';

const STATIC_PAGES: Record<string, ReactNode> = {
  '/': <HomePage />,
  '/foo': <FooPage />,
  '/bar': <BarPage />,
  '/nested/baz': <NestedBazPage />,
};

const root = {
  immutable: true,
  render: () => (
    <Root>
      <Children />
    </Root>
  ),
};

const homeLayout = {
  immutable: true,
  render: () => (
    <HomeLayout>
      <Children />
    </HomeLayout>
  ),
};

export default adapter(
  defineRouter({
    resolve: async (pathname) => {
      if (pathname === '/api/hi') {
        return async () => {
          return new Response(
            new ReadableStream({
              start(controller) {
                controller.enqueue(new TextEncoder().encode('hello world!'));
                controller.close();
              },
            }),
          );
        };
      }
      if (pathname === '/api/hi.txt') {
        return async () => {
          const hiTxt = await readFile('./private/hi.txt');
          return new Response(
            new ReadableStream({
              start(controller) {
                controller.enqueue(hiTxt);
                controller.close();
              },
            }),
          );
        };
      }
      if (pathname === '/api/empty') {
        return async () => {
          return new Response(null, {
            status: 200,
          });
        };
      }
      if (pathname in STATIC_PAGES) {
        return {
          elements: {
            root,
            route: {
              immutable: true,
              render: () => <Slot id="layout:/">{STATIC_PAGES[pathname]}</Slot>,
            },
            'layout:/': homeLayout,
          },
        };
      }
      if (/^\/dynamic\/[^/]+$/.test(pathname)) {
        return {
          elements: {
            root,
            route: {
              render: () => (
                <Slot id="layout:/">
                  <h3>{pathname}</h3>
                </Slot>
              ),
            },
            'layout:/': homeLayout,
          },
        };
      }
      return null;
    },
    getBuildPaths: async () => [...Object.keys(STATIC_PAGES), '/api/hi.txt'],
  }),
);
