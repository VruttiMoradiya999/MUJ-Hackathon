import { useCallback } from 'react';
import { useApi } from './useApi.js';
import { getProducts, getProduct } from '../api/productsApi.js';

export function useProducts(params = {}) {
  const { search, category } = params;
  const fetcher = useCallback(
    () => getProducts({ search, category }),
    [search, category]
  );
  return useApi(fetcher, { deps: [search, category] });
}

export function useProduct(productId) {
  const fetcher = useCallback(() => {
    if (!productId) return Promise.resolve(null);
    return getProduct(productId);
  }, [productId]);
  return useApi(fetcher, { deps: [productId], enabled: Boolean(productId) });
}

export default useProducts;
