import { useCallback } from 'react';
import { useApi } from './useApi.js';
import { getWorkingCapital } from '../api/workingCapitalApi.js';

export function useWorkingCapital() {
  const fetcher = useCallback(() => getWorkingCapital(), []);
  return useApi(fetcher);
}

export default useWorkingCapital;
