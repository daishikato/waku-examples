# Next.js Commerce → Waku

A migration of [`vercel/commerce`](https://github.com/vercel/commerce) — the
Shopify storefront — to Waku. It is the largest example of the set, and the one
that lands on Waku's stated strong fit: a mostly static catalogue with a cart,
search and personalisation that must always be fresh.

Code taken from the original is © Vercel, Inc., under the MIT license in
[`LICENSE`](LICENSE).

```sh
pnpm install
pnpm typegen
pnpm dev            # http://localhost:3000
```

No Shopify store is needed. `src/lib/shopify/` keeps the same exported functions
the components already import, backed by `fixture-data.ts` instead of the
Storefront API. In a real migration that directory moves across untouched apart
from the four Next.js APIs listed below.

## What changed

| Next.js | Waku |
| --- | --- |
| `app/layout.tsx` | `src/pages/_root.tsx` (document + fonts) + `src/pages/_layout.tsx` (cart provider, navbar) |
| `app/[page]/page.tsx` + `layout.tsx` | `src/pages/[page]/index.tsx` + `_layout.tsx` |
| `app/search/[collection]/page.tsx` | `src/pages/search/[collection].tsx` |
| `metadata` / `generateMetadata()` | tags rendered with the layout and the page, the page's overriding the layout's; with no title template, each page writes its full title |
| `app/sitemap.ts`, `app/robots.ts` | `src/pages/_api/sitemap.xml.ts`, `_api/robots.txt.ts` |
| `app/opengraph-image.tsx` and its per-route variants (`next/og`) | `src/pages/_api/opengraph-image.ts`, one PNG endpoint keyed by the route's handle |
| `app/api/revalidate/route.ts` | `src/pages/_api/api/revalidate.ts` — `_api` is stripped from the URL, so the extra `api/` keeps the webhook at `/api/revalidate` |
| `app/error.tsx` | `<StorefrontErrorBoundary>` in the root layout |
| `app/search/loading.tsx` | none: a `<Suspense>` above the page would keep its `<title>` out of the head |
| `"use cache"`, `cacheTag`, `cacheLife`, `revalidateTag` | deleted — Waku has no cache |
| `updateTag(TAGS.cart)` in the cart actions | `unstable_rerenderRoute()`, which renders the page again with the fresh cart that `useOptimistic` settles on |
| `cookies()` | `src/lib/cookie-jar.ts` + `src/middleware/cookies.ts` |
| `next/link`, `next/navigation` | `src/lib/navigation.tsx` (see below) |
| `next/image` | plain `<img>` |
| `next/form` | a plain `<form action="/search">` |
| `geist/font/sans` | `@fontsource-variable/geist` |
| `next.config.ts` | `waku.config.ts` |

## A compatibility layer instead of a rename

`src/lib/navigation.tsx` is six exports — `Link` (taking `href`), `usePathname`,
`useSearchParams`, `useRouterCompat` — implemented over Waku's `Link` and
`useRouter`. Sixteen component files then change only their import line, and the
diff stays readable.

That is a deliberate contrast with the `nextjs-dashboard` example, which uses
Waku's API directly (`<Link to>`, `useRouter().path`). Both are fine; the shim
scales better on a large app, and it is also the natural place to put the one
cast typed routes need for hrefs built at runtime.

## The one thing that actually broke

**Creating the cart and reading it back.** `createCartAndSetCookie()` writes a
cookie and the very next render has to see it. Waku's read path is the raw request
headers, so a cookie written during the request is invisible to it. The jar in
`src/lib/cookie-jar.ts` is therefore readable as well as writable.

## Smaller notes

- The homepage and every product page are `render: 'dynamic'`, because the root
  layout reads the cart cookie. Prerendering the catalogue would mean moving the
  cart into a [slice](https://waku.gg/#slices) so the rest of the page can stay
  static — the Waku equivalent of the partial prerendering the original enables.
- `next/og`'s `ImageResponse` has no counterpart, so the OG endpoint calls
  `satori` and `@resvg/resvg-js`, which is what `ImageResponse` does underneath.
  It returns PNG because social crawlers do not render SVG, and `og:image` URLs
  are absolute, built from `baseUrl` as the original's `metadataBase` built them.
  Product pages point `og:image` at the endpoint rather than at the featured
  image, which is an SVG in the fixture data. `waku.config.ts` has Node load
  both libraries from `node_modules` instead of bundling them.
- `next/form` did a client-side navigation on submit; a plain form does a full
  page load.
- The fixture cart's `checkoutUrl` is `/checkout`, a page that stands in for the
  Shopify-hosted checkout the original redirects to.
- `tsconfig.json`'s `baseUrl` is removed in TypeScript 7, so the `lib/…` and
  `components/…` imports resolve through `paths`, mirrored as Vite aliases in
  `waku.config.ts`.
