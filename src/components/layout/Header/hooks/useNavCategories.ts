"use client";

import { useEffect, useRef, useState } from "react";
import type { NavCategory } from "../types";

// Intervalo largo — los tipos de prenda cambian raramente
const FINGERPRINT_POLL_MS = 5 * 60 * 1000; // 5 minutos

/**
 * Mantiene las categorías de navegación actualizadas en background.
 *
 * Estrategia en dos pasos para minimizar el impacto en rendimiento:
 *  1. Cada 5 min consulta /api/nav-categories/fingerprint — solo 2 agregados SQL,
 *     sin joins, sin arrays. Es extremadamente barato.
 *  2. Solo si la firma cambió se trae el payload completo desde /api/nav-categories.
 *
 * Resultado: en condiciones normales (sin cambios) → 0 KB de datos transferidos.
 * El primer render siempre usa los datos SSR sin coste adicional.
 */
export function useNavCategories(initialCategories: NavCategory[]): NavCategory[] {
  const [categories, setCategories] = useState<NavCategory[]>(initialCategories);
  // "__init__" nunca coincide con una firma real → el primer tick siempre sincroniza
  const sigRef = useRef<string>("__init__");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        // Paso 1: consulta ultraliviana (solo 2 agregados)
        const sigRes = await fetch("/api/nav-categories/fingerprint", {
          cache: "no-store",
        });
        if (!sigRes.ok) return;
        const { sig } = await sigRes.json() as { sig: string };

        // Si la firma no cambió, no hay nada que hacer
        if (sig === sigRef.current) return;
        sigRef.current = sig;

        // Paso 2: traer datos completos solo cuando algo cambió
        const dataRes = await fetch("/api/nav-categories", { cache: "no-store" });
        if (!dataRes.ok) return;
        const data: NavCategory[] = await dataRes.json();
        setCategories(data);
      } catch {
        // Silencioso: si falla el poll se mantienen los datos del SSR
      }
    };

    intervalRef.current = setInterval(poll, FINGERPRINT_POLL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return categories;
}
