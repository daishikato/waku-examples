# waku-examples

A collection of [Waku](https://waku.gg) examples, grouped by the **Waku API** they
use, since that is the choice that most shapes how an app is written:

- [`fs-router/`](#fs-router) - file-system routing (the default for most apps)
- [`create-pages/`](#create-pages) - the low-level routing API (`createPages`)
- [`define-router/`](#define-router) - custom routing with `unstable_defineRouter`
- [`minimal-api/`](#minimal-api) - the low-level minimal RSC primitives

If you are instead looking for a particular **topic** (styling, forms, state,
deployment, etc.), jump to the [topic index](#by-topic).

## By API

### fs-router

File-system routing under `src/pages`. Most examples run in managed mode (no
server entry); those marked _explicit_ provide a `src/waku.server.tsx` that calls
`fsRouter` directly, usually to customize the adapter.

| Example | What it shows |
| --- | --- |
| [`basic`](fs-router/basic) | Basic app (Tailwind CSS, React Compiler) |
| [`basic-js`](fs-router/basic-js) | Basic app in JavaScript |
| [`data-fetching`](fs-router/data-fetching) | Async server components fetching data |
| [`css-modules`](fs-router/css-modules) | Scoped styling with CSS Modules |
| [`stylex`](fs-router/stylex) | Styling with StyleX (zero-runtime CSS-in-JS) |
| [`vanilla-extract`](fs-router/vanilla-extract) | Styling with Vanilla Extract (compile-time CSS-in-JS) |
| [`form`](fs-router/form) | Server actions and form handling |
| [`jotai`](fs-router/jotai) | Global state with Jotai (`waku-jotai`) |
| [`features`](fs-router/features) | Feature tour: layouts, slices, segments, API routes _(explicit)_ |
| [`tanstack-router`](fs-router/tanstack-router) | Replace the client router with TanStack Router _(explicit)_ |
| [`no-ssr`](fs-router/no-ssr) | Disable SSR for client-only rendering _(explicit)_ |
| [`cloudflare`](fs-router/cloudflare) | Deploy to Cloudflare Workers _(explicit)_ |
| [`nextjs-blog-starter`](fs-router/nextjs-blog-starter) | Next.js blog-starter, migrated: static generation, metadata, markdown |
| [`nextjs-dashboard`](fs-router/nextjs-dashboard) | Next.js Learn dashboard, migrated: auth, a database, server actions, search |
| [`nextjs-commerce`](fs-router/nextjs-commerce) | Next.js Commerce, migrated: cookies, optimistic UI, sitemap and OG images |
| [`nextjs-photo-modal`](fs-router/nextjs-photo-modal) | Nextgram, reimplemented: parallel and intercepting routes |

### create-pages

The low-level routing API. `createPages` registers routes programmatically
(pages, layouts, slices, and API routes) from `waku/router/server`.

| Example | What it shows |
| --- | --- |
| [`basic`](create-pages/basic) | Pages, layouts, slices, and API routes defined in code |
| [`react-tweet`](create-pages/react-tweet) | Embed a third-party component (`react-tweet`) with SSR |
| [`weave-render`](create-pages/weave-render) | Weave async server components with client components |
| [`view-transitions`](create-pages/view-transitions) | Animate navigation with the View Transitions API |

### define-router

The lower-level `unstable_defineRouter` API, for building custom routing on top
of Waku's router.

| Example | What it shows |
| --- | --- |
| [`basic`](define-router/basic) | Manual route configuration with `unstable_defineRouter` |

### minimal-api

The low-level RSC primitives from `waku/minimal/*`. Intended for library
authors, custom runtimes, and learning how Waku works underneath.

| Example | What it shows |
| --- | --- |
| [`basic`](minimal-api/basic) | Minimal RSC + SSR with the minimal API (TypeScript) |
| [`basic-js`](minimal-api/basic-js) | Minimal RSC + SSR (JavaScript) |
| [`promise`](minimal-api/promise) | Stream RSC payloads and compose with `<Children>` |
| [`functions`](minimal-api/functions) | Server functions that return a value and re-render |
| [`nesting`](minimal-api/nesting) | Nested slots and `useRefetch` |
| [`form`](minimal-api/form) | Server actions with `formState` (progressive enhancement) |
| [`css`](minimal-api/css) | CSS Modules with the `classnames` helper |
| [`cookies`](minimal-api/cookies) | Read/write cookies and headers via Hono middleware |
| [`api`](minimal-api/api) | Custom API endpoints alongside RSC |
| [`path-alias`](minimal-api/path-alias) | TypeScript path aliases (`@/*`) |
| [`spa`](minimal-api/spa) | Single-page-app mode (client-only) with server functions |
| [`islands`](minimal-api/islands) | Islands architecture (selective hydration) |
| [`jotai`](minimal-api/jotai) | Jotai state with the minimal API (`waku-jotai`) |

## By topic

The same examples, grouped by what they teach.

| Topic | Examples |
| --- | --- |
| Getting started | [`fs-router/basic`](fs-router/basic), [`fs-router/basic-js`](fs-router/basic-js), [`minimal-api/basic`](minimal-api/basic), [`minimal-api/basic-js`](minimal-api/basic-js) |
| Routing | [`fs-router/features`](fs-router/features), [`fs-router/tanstack-router`](fs-router/tanstack-router), [`create-pages/basic`](create-pages/basic), [`define-router/basic`](define-router/basic) |
| Styling | [`fs-router/css-modules`](fs-router/css-modules), [`fs-router/stylex`](fs-router/stylex), [`fs-router/vanilla-extract`](fs-router/vanilla-extract), [`minimal-api/css`](minimal-api/css) |
| Data fetching | [`fs-router/data-fetching`](fs-router/data-fetching) |
| Mutations (forms, actions, API) | [`fs-router/form`](fs-router/form), [`minimal-api/form`](minimal-api/form), [`minimal-api/functions`](minimal-api/functions), [`minimal-api/api`](minimal-api/api) |
| State management | [`fs-router/jotai`](fs-router/jotai), [`minimal-api/jotai`](minimal-api/jotai) |
| Rendering & architecture | [`fs-router/no-ssr`](fs-router/no-ssr), [`create-pages/weave-render`](create-pages/weave-render), [`minimal-api/promise`](minimal-api/promise), [`minimal-api/nesting`](minimal-api/nesting), [`minimal-api/spa`](minimal-api/spa), [`minimal-api/islands`](minimal-api/islands) |
| Navigation & UX | [`create-pages/view-transitions`](create-pages/view-transitions) |
| Request handling | [`minimal-api/cookies`](minimal-api/cookies) |
| Integrations | [`create-pages/react-tweet`](create-pages/react-tweet), [`fs-router/tanstack-router`](fs-router/tanstack-router) |
| Deployment | [`fs-router/cloudflare`](fs-router/cloudflare) |
| Tooling & config | [`minimal-api/path-alias`](minimal-api/path-alias) |
| Migrating from Next.js | [`fs-router/nextjs-blog-starter`](fs-router/nextjs-blog-starter), [`fs-router/nextjs-dashboard`](fs-router/nextjs-dashboard), [`fs-router/nextjs-commerce`](fs-router/nextjs-commerce), [`fs-router/nextjs-photo-modal`](fs-router/nextjs-photo-modal) |

## Running an example

Each example is a standalone Waku project.

```sh
cd <group>/<name>
pnpm install
pnpm dev
```
