import type { Metadata } from "next";

// ── Constantes globales del sitio ────────────────────────────────────────────

export const SITE_NAME = "Casa Verde";
export const SITE_URL = "https://casaverdeoficial.com";
export const SITE_LOCALE = "es_CO";
export const DEFAULT_DESCRIPTION =
  "Moda con esencia natural. Descubre ropa con conciencia, estilo y calidad colombiana.";

// ── Metadata base (aplicada en layout.tsx) ───────────────────────────────────
// Todas las páginas heredan esto. Cada page.tsx puede sobreescribir
// los campos que necesite — los demás se mantienen del base.

export const BASE_METADATA: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`, // Ej: "Tienda | Casa Verde"
  },
  description: DEFAULT_DESCRIPTION,
  robots: { index: true, follow: true },
  openGraph: {
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/icon.png",
  },
};

// ── Metadata para páginas privadas (admin, checkout, perfil) ─────────────────
// Estas páginas no deben aparecer en Google aunque un bot las descubra.

export const NOINDEX_METADATA: Metadata = {
  robots: { index: false, follow: false },
};
