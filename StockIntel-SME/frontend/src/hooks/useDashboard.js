import { useCallback } from 'react';
import { useApi } from './useApi.js';
import { getDashboard } from '../api/dashboardApi.js';

export function useDashboard() {
  const fetcher = useCallback(() => getDashboard(), []);
  return useApi(fetcher);
}

export default useDashboard;
