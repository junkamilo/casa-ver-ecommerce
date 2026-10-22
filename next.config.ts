import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { REMOTE_IMAGE_HOSTS, isPosMediaLocal, posMediaRemotePattern } from "./src/lib/image-hosts";

const posMediaPattern = posMediaRemotePattern();

// En desarrollo la app también se abre por el túnel ngrok de NEXT_PUBLIC_APP_URL (pagos Bold/Addi).
function devTunnelHost(): string | null {
  try {
    const { hostname } = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "");
    return hostname && hostname !== "localhost" ? hostname : null;
  } catch {
    return null;
  }
}
const tunnelHost = process.env.NODE_ENV === "production" ? null : devTunnelHost();

// Orígenes extra para server actions (ej. dominios de QA), separados por coma.
// Producción de Vercel no define esta variable, así que su lista no cambia.
const extraServerActionOrigins = (process.env.EXTRA_SERVER_ACTION_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  ...(tunnelHost ? { allowedDevOrigins: [tunnelHost] } : {}),
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [96, 128, 192, 256, 384],
    remotePatterns: [
      ...REMOTE_IMAGE_HOSTS.map((hostname) => ({ protocol: "https" as const, hostname })),
      // Fotos del POS (NEXT_PUBLIC_POS_MEDIA_BASE_URL).
      ...(posMediaPattern ? [posMediaPattern] : []),
    ],
    // Solo en desarrollo, cuando el POS corre en localhost.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production" && isPosMediaLocal(),
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },

  experimental: {
    serverActions: {
      allowedOrigins:
        process.env.NODE_ENV === "production"
          ? [
            "casaverdeoficial.com",
            "www.casaverdeoficial.com",
            ...extraServerActionOrigins,
          ]
          : ["localhost:3000", ...(tunnelHost ? [tunnelHost] : [])],
    },
    // Persiste compilaciones de Turbopack entre reinicios de `next dev`.
    turbopackFileSystemCacheForDev: true,
    // Solo en producción: datos siempre frescos al navegar en el cliente.
    // En dev, el default de Next evita re-fetch en cada clic (menos "Compiling…").
    ...(process.env.NODE_ENV === "production"
      ? { staleTimes: { dynamic: 0 } }
      : {}),
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
