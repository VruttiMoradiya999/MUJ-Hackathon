import { useCallback } from 'react';
import { useApi } from './useApi.js';
import { getAlerts } from '../api/alertsApi.js';

export function useAlerts(params = {}) {
  const { type, severity } = params;
  const fetcher = useCallback(
    () => getAlerts({ type, severity }),
    [type, severity]
  );
  return useApi(fetcher, { deps: [type, severity] });
}

export default useAlerts;
