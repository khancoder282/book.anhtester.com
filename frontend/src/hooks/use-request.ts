import { useMemo, useState, useEffect, useCallback } from 'react';

/**
 * Hook to handle a request to an API.
 * @param {Function} callback - A function that returns a Promise.
 * @param {boolean} auto - If true, the request will be called automatically when the hook is mounted.
 * @returns {Object} An object containing the following properties:
 *   loading: boolean - If true, the request is currently being made.
 *   error: unknown - Any error that occurred during the request.
 *   data: T - The data returned from the request.
 *   request: Function - A function that can be called to manually make the request.
 * @example
 * const { loading, error, data, request } = useRequest(() => axios.get('/api/data'));
 * // or
 * const { loading, error, data, request } = useRequest(useCallback(() => axios.get('/api/data'), []), false);
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
