import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '@/api/client';

/** Minimal data-fetching hook: { data, loading, error, reload, setData }. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps);
  const reload = useCallback(async () => {
    setLoading(true);
    try { setData(await run()); setError(null); }
    catch (e) { setError(errorMessage(e)); }
    finally { setLoading(false); }
  }, [run]);
  useEffect(() => { reload(); }, [reload]);
  return { data, loading, error, reload, setData };
}