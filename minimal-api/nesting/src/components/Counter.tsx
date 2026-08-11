'use client';

import { useCallback, useState, useTransition } from 'react';
import {
  Slot_UNSTABLE as Slot,
  unstable_fetchRsc as fetchRsc,
  unstable_registerRscReloadListener as registerRscReloadListener,
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

export const Counter = ({ enableInnerApp }: { enableInnerApp?: boolean }) => {
  const [count, setCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  const refetch = useRefetch();
  const handleClick = async () => {
    if (enableInnerApp) {
      const nextCount = count + 1;
      setCount(nextCount);
      await refetch('InnerApp=' + nextCount);
    } else {
      setCount((c) => c + 1);
    }
  };
  const handleClickWithTransition = () => {
    startTransition(async () => {
      await handleClick();
    });
  };
  return (
    <div style={{ border: '3px blue dashed', margin: '1em', padding: '1em' }}>
      <p>Count: {count}</p>
      <button onClick={handleClick}>Increment</button>
      {enableInnerApp && (
        <button onClick={handleClickWithTransition} disabled={isPending}>
          Increment with transition
        </button>
      )}
      {isPending && 'Pending...'}
      <h3>This is a client component.</h3>
      {enableInnerApp && <Slot id="InnerApp" />}
    </div>
  );
};
