// src/features/offers/model/use-countdown.ts
import { useEffect, useState } from 'react';

/** Milliseconds left until `expiresAt` (ISO). Ticks 4 times a second. */
export function useCountdown(expiresAt: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  return Math.max(0, new Date(expiresAt).getTime() - now);
}
