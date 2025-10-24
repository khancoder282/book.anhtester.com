import { useMemo, useState, useEffect, useCallback } from 'react';

/**
 * Hook to handle request to API with loading, error and data state management
 * @param callback - function to call API
 * @param auto - boolean to indicate whether to call API automatically or not
 * @returns an object containing loading, error, data, setData, request and setError
 */
export function useRequest<T>(callback: () => Promise<T>, auto = true) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  const [data, setData] = useState<T>();

  const request = useCallback(async () => {
    setLoading(true);
    try {
      const response = await callback();
      setData(response);
      setError(undefined);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [callback]);

  useEffect(() => {
    if (auto) request();
  }, [auto, request]);

  return useMemo(
    () => ({ loading, error, data, setData, request, setError }),
    [loading, error, data, setData, request]
  );
}
