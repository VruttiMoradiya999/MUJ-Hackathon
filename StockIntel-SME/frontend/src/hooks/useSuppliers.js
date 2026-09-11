import { useCallback } from 'react';
import { useApi } from './useApi.js';
import { getSuppliers } from '../api/suppliersApi.js';

export function useSuppliers(params = {}) {
  const { search } = params;
  const fetcher = useCallback(() => getSuppliers({ search }), [search]);
  return useApi(fetcher, { deps: [search] });
}

export default useSuppliers;
