"use client";

import { useSyncExternalStore } from "react";

/** `true` solo en el cliente — evita hydration mismatch con portals. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
