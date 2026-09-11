import { useCallback } from 'react';
import { useApi } from './useApi.js';
import { getBundles } from '../api/bundlesApi.js';

export function useBundles(productId) {
  const fetcher = useCallback(() => getBundles(productId), [productId]);
  return useApi(fetcher, { deps: [productId] });
}

export default useBundles;
