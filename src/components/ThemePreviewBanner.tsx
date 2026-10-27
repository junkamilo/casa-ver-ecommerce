"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PosThemeTokens } from "@/modules/posIntegration/contracts/pos-themes.schema";

/** Tema en vista previa durante la sesión de la pestaña: sigue aplicado al navegar por la tienda. */
const STORAGE_KEY = "cv-preview-theme-id";
const STYLE_ID = "cv-preview-theme";
const ID_RE = /^[0-9a-fA-F-]{8,64}$/;

function readStoredId(): string {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function storeId(id: string | null) {
  try {
    if (id) sessionStorage.setItem(STORAGE_KEY, id);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sin almacenamiento (modo privado): la vista previa dura solo en esta página.
  }
}

function removePreviewStyle() {
  document.getElementById(STYLE_ID)?.remove();
}

/**
 * Vista previa de un tema desde Diseño → Temas del POS (`/?preview_theme_id=<uuid>`): aplica sus colores sobre
 * el tema activo solo en este navegador, sin publicarlo. «Salir» vuelve al tema activo.
 */
function ThemePreviewInner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const queryId = searchParams.get("preview_theme_id")?.trim() ?? "";
  const [previewTheme, setPreviewTheme] = useState<PosThemeTokens | null>(null);

  useEffect(() => {
    const previewId = queryId || readStoredId();
    if (!ID_RE.test(previewId)) return;

    let active = true;
    fetch(`/api/theme/preview?id=${encodeURIComponent(previewId)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { data?: { tokens?: PosThemeTokens; css?: string } } | null) => {
        if (!active) return;
        if (!payload?.data?.tokens || !payload.data.css) {
          // Tema inexistente o borrado: se sale de la vista previa.
          storeId(null);
          removePreviewStyle();
          setPreviewTheme(null);
          return;
        }
        storeId(previewId);
        let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
        if (!styleEl) {
          styleEl = document.createElement("style");
          styleEl.id = STYLE_ID;
          document.head.appendChild(styleEl);
        }
        styleEl.textContent = payload.data.css;
        setPreviewTheme(payload.data.tokens);
      })
      .catch(() => {
        // Ignorar errores de red en modo vista previa
      });

    return () => {
      active = false;
    };
  }, [queryId]);

  if (!previewTheme) return null;

  function exitPreview() {
    storeId(null);
    removePreviewStyle();
    setPreviewTheme(null);
    if (!queryId) return;
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("preview_theme_id");
    const qs = nextParams.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-[9999] flex items-center gap-3 rounded-full border border-white/25 px-4 py-2 text-xs font-semibold shadow-xl backdrop-blur-md"
      style={{
        backgroundColor: previewTheme.colors.primary,
        color: previewTheme.colors.primaryForeground,
      }}
    >
      <span
        className="size-2.5 rounded-full"
        style={{ backgroundColor: previewTheme.colors.accent }}
      />
      <span>Vista previa POS: {previewTheme.name}</span>
      <button
        type="button"
        onClick={exitPreview}
        className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase transition-opacity hover:opacity-90"
        style={{
          backgroundColor: previewTheme.colors.accent,
          color: previewTheme.colors.accentForeground,
        }}
      >
        Salir
      </button>
    </div>
  );
}

export default function ThemePreviewBanner() {
  return (
    <Suspense fallback={null}>
      <ThemePreviewInner />
    </Suspense>
  );
}
