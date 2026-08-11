'use client';

import { use, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  Slot_UNSTABLE as Slot,
  unstable_fetchRsc as fetchRsc,
  unstable_registerRscReloadListener as registerRscReloadListener,
  useElementsPromise_UNSTABLE as useElementsPromise,
  useMergeElements_UNSTABLE as useMergeElements,
} from 'waku/minimal/client';

// The minimal API intentionally leaves refetching to userland.
const useRefetch = () => {
  const mergeElements = useMergeElements();
  return useCallback(
    (rscPath: string, rscParams?: unknown) => {
      const refetch = () => mergeElements(fetchRsc(rscPath, rscParams));
      registerRscReloadListener(
        () => {
          void refetch();
        },
        { replace: true },
      );
      return refetch();
    },
    [mergeElements],
  );
};

const getSliceSlotId = (id: string) => 'slice:' + id;

export function Slice({
  id,
  fetchArgs,
  children,
  fallback,
}: {
  id: string;
  fetchArgs?: readonly [rscPath: string, rscParams?: unknown];
  children?: ReactNode;
  fallback?: ReactNode;
}) {
  const hasFetchArgs = !!fetchArgs;
  const [rscPath, rscParams] = hasFetchArgs ? fetchArgs : [''];
  const refetch = useRefetch();
  const slotId = getSliceSlotId(id);
  const elementsPromise = useElementsPromise();
  const elements = use(elementsPromise);
  const hasSlice = slotId in elements;
  useEffect(() => {
    if (!hasSlice && hasFetchArgs) {
      refetch(rscPath, rscParams).catch((e) => {
        console.error('Failed to refetch:', e);
      });
    }
  }, [refetch, hasFetchArgs, rscPath, rscParams, hasSlice]);
  if (!hasSlice) {
    return fallback;
  }
  return <Slot id={slotId}>{children}</Slot>;
}
