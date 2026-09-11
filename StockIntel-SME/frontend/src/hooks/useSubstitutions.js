import { useCallback } from 'react';
import { useApi } from './useApi.js';
import { getSubstitutions } from '../api/substitutionsApi.js';

export function useSubstitutions(productId) {
  const fetcher = useCallback(() => getSubstitutions(productId), [productId]);
  return useApi(fetcher, { deps: [productId] });
}

export default useSubstitutions;
