import { useEffect, useState } from 'react';

export function useCountdown(endTime?: string | null) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!endTime) {
      setRemaining(0);
      return;
    }

    const end = new Date(endTime).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setRemaining(diff);
    };

    tick(); // immediate sync
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return remaining;
}
