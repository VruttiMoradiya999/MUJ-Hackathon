import { useCallback } from 'react';
import { useApi } from './useApi.js';
import { getRecommendations } from '../api/recommendationsApi.js';

export function useRecommendations(params = {}) {
  const { priority } = params;
  const fetcher = useCallback(
    () => getRecommendations({ priority }),
    [priority]
  );
  return useApi(fetcher, { deps: [priority] });
}

export default useRecommendations;
