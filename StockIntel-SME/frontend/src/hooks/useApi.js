import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Generic data-fetching hook.
 * Returns { data, loading, error, refetch }.
 *
 * @param {() => Promise<any>} fetcher - async function that returns data
 * @param {object} options
 * @param {any[]} options.deps - dependency array (like useEffect)
 * @param {boolean} options.enabled - when false, skips the fetch
 * @param {any} options.initialData
 */
export function useApi(fetcher, options = {}) {
  const { deps = [], enabled = true, initialData = null } = options;
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const execute = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        setData(initialData);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [enabled, initialData]);

  useEffect(() => {
    mountedRef.current = true;
    execute();
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, ...deps]);

  return {
    data,
    loading,
    error,
    refetch: execute,
  };
}

export default useApi;
