"use client";

import { useEffect, useRef, useState } from "react";
import type { NavCategory } from "../types";

const POLL_INTERVAL_MS = 60_000; // 60 segundos — silencioso, sin impacto en rendimiento

/**
 * Mantiene las categorías de navegación actualizadas en background.
 * - El primer render usa los datos SSR (sin coste adicional).
 * - Cada 60 s consulta /api/nav-categories y actualiza el estado SOLO si
 *   los datos cambiaron (comparación por firma JSON), evitando re-renders innecesarios.
 */
export function useNavCategories(initialCategories: NavCategory[]): NavCategory[] {
  const [categories, setCategories] = useState<NavCategory[]>(initialCategories);
  const signatureRef = useRef<string>(JSON.stringify(initialCategories));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/nav-categories", { cache: "no-store" });
        if (!res.ok) return;
        const data: NavCategory[] = await res.json();
        const newSignature = JSON.stringify(data);
        if (newSignature !== signatureRef.current) {
          signatureRef.current = newSignature;
          setCategories(data);
        }
      } catch {
        // Silencioso: si falla el poll, se mantienen los datos actuales
      }
    };

    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return categories;
}
