"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const DEBOUNCE_MS = 250;
const MIN_QUERY_LENGTH = 2;

/**
 * Input inmediato + debounce a `?q=` (conserva el resto de query params).
 * Al cambiar `q` se quita `page` para volver a la primera página en Tienda.
 * Query vacía o menor a 2 caracteres: se elimina `q` de la URL.
 */
export function useSearchQueryParam(param = "q") {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlValue = searchParams.get(param) ?? "";
  const [value, setValue] = useState(urlValue);

  // Ajuste de estado en render (back/forward u otra navegación), no en effect.
  const [prevUrlValue, setPrevUrlValue] = useState(urlValue);
  if (urlValue !== prevUrlValue) {
    setPrevUrlValue(urlValue);
    setValue(urlValue);
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const trimmed = value.trim();
      const next = trimmed.length >= MIN_QUERY_LENGTH ? trimmed : "";
      const params = new URLSearchParams(searchParams.toString());
      const current = params.get(param) ?? "";
      if (next === current) return;

      if (next) params.set(param, next);
      else params.delete(param);
      params.delete("page");

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [value, pathname, router, param, searchParams]);

  return {
    value,
    onChange: setValue,
    onClear: () => setValue(""),
  };
}
