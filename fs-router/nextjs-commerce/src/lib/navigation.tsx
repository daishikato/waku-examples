'use client';

import { useMemo, type ComponentProps } from 'react';
import { Link as WakuLink, useRouter } from 'waku';

// A compatibility layer for next/link and next/navigation.
//
// Waku's own API is `<Link to>` and a single `useRouter()` that carries `path`
// and `query`. Renaming every call site would have been a large diff across a
// large app for no behavioural gain, so this module keeps the Next.js-shaped
// API and the components change only their import line. The dashboard example
// in this repo does it the other way, using Waku's API directly.

type WakuLinkProps = ComponentProps<typeof WakuLink>;
type RouteHref = Extract<WakuLinkProps['to'], string>;

export type LinkProps = Omit<WakuLinkProps, 'to'> & {
  href: string;
  /** next/link's prefetch flag; Waku prefetches on hover instead. */
  prefetch?: boolean;
};

export function Link({ href, prefetch: _prefetch, ...rest }: LinkProps) {
  // Hrefs here are built at runtime from collection paths and search params.
  // Waku's typed routes only accept known route patterns, so the cast is made
  // once, here, instead of at every call site.
  return <WakuLink to={href as RouteHref} {...rest} />;
}

export const usePathname = () => useRouter().path;

// next/navigation hands back the same object until the URL changes, and the
// components rely on it: mobile-menu.tsx closes the menu in an effect keyed on
// it, so a new object on every render would close the menu as it opens.
export const useSearchParams = () => {
  const { query } = useRouter();
  return useMemo(() => new URLSearchParams(query), [query]);
};

export const useRouterCompat = () => {
  const router = useRouter();
  return {
    push: (href: string) => router.push(href as RouteHref),
    replace: (href: string) => router.replace(href as RouteHref),
  };
};
