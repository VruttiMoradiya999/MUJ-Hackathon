import { useCallback } from 'react';
import { useApi } from './useApi.js';
import { getForecast } from '../api/forecastApi.js';

export function useForecast(productId) {
  const fetcher = useCallback(() => getForecast(productId), [productId]);
  return useApi(fetcher, { deps: [productId] });
}

export default useForecast;
