"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatLaunchDateLabel,
  getLaunchAtTimestamp,
  getLaunchCountdown,
  type LaunchCountdown,
} from "@/lib/launch-lock";

export interface UseLaunchCountdownResult extends LaunchCountdown {
  isExpired: boolean;
  launchDateLabel: string;
}

/**
 * Countdown en tiempo real hacia la fecha de apertura. Actualiza cada segundo
 * y expone `isExpired: true` cuando el reloj llega a cero.
 */
export function useLaunchCountdown(): UseLaunchCountdownResult {
  const launchAtMs = useMemo(() => getLaunchAtTimestamp(), []);
  const launchDateLabel = useMemo(
    () => formatLaunchDateLabel(new Date(launchAtMs)),
    [launchAtMs],
  );

  const [countdown, setCountdown] = useState<LaunchCountdown>(() =>
    getLaunchCountdown(new Date(), new Date(launchAtMs)),
  );

  const isExpired = countdown.totalMs <= 0;

  useEffect(() => {
    const launchAt = new Date(launchAtMs);

    const tick = () => {
      setCountdown((prev) => {
        const next = getLaunchCountdown(new Date(), launchAt);
        if (
          prev.days === next.days &&
          prev.hours === next.hours &&
          prev.minutes === next.minutes &&
          prev.seconds === next.seconds &&
          prev.totalMs === next.totalMs
        ) {
          return prev;
        }
        return next;
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [launchAtMs]);

  return {
    ...countdown,
    isExpired,
    launchDateLabel,
  };
}
