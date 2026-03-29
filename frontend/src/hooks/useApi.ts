import { useState, useEffect, useCallback } from 'react';

interface UseApiOptions<T> {
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApi<T>(
  callback: () => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await callback();
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      options.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [callback, options.onSuccess, options.onError]);

  useEffect(() => {
    if (options.enabled !== false) {
      execute();
    }
  }, [execute, options.enabled]);

  return { data, isLoading, error, execute };
}

export default useApi;