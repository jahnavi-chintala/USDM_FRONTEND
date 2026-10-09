import { useEffect, useState } from 'react';

/** Whole seconds since `since`, updated every second. */
export function useElapsedSeconds(since: string | undefined): number | undefined {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!since) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [since]);

  if (!since) return undefined;
  const start = new Date(since).getTime();
  return Number.isNaN(start) ? undefined : Math.max(0, Math.floor((now - start) / 1000));
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes} min ${seconds.toString().padStart(2, '0')} s` : `${seconds} s`;
}
