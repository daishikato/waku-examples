'use client';

import { useEffect } from 'react';
import { useRouter } from 'waku/router/client';

export const RoutingHandler = () => {
  const { path, query, hash } = useRouter();
  useEffect(() => {
    console.log('Route changed', { path, query, hash });
  }, [path, query, hash]);
  return null;
};
