import { useCallback, useEffect, useState } from 'react';

/** "m:ss" for the wait before a link can be sent again, e.g. 30 becomes "00:30". */
export const formatCountdown = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

/** Counts down once a second from `seconds` to 0; `restart` starts it again. */
export function useResendCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {return;}
    const timer = window.setTimeout(() => setRemaining((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [remaining]);

  const restart = useCallback(() => setRemaining(seconds), [seconds]);

  return { remaining, isReady: remaining <= 0, restart };
}
