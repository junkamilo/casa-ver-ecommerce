// ── Launch lock — bloqueo temporal de la tienda pública ───────────────────────
//
// Variables de entorno (opcionales):
//   NEXT_PUBLIC_LAUNCH_LOCK_ENABLED=true|false  — activo por defecto (cualquier valor distinto de "false")
//   NEXT_PUBLIC_LAUNCH_AT=2026-06-13T12:00:00-05:00 — instante de apertura (ISO con offset Colombia)

export const DEFAULT_LAUNCH_AT_ISO = "2026-06-13T12:00:00-05:00";

export interface LaunchCountdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

function readLaunchAtIso(): string {
  return process.env.NEXT_PUBLIC_LAUNCH_AT?.trim() || DEFAULT_LAUNCH_AT_ISO;
}

export function isLaunchLockEnabled(): boolean {
  return process.env.NEXT_PUBLIC_LAUNCH_LOCK_ENABLED !== "false";
}

/** Instant de apertura parseado como Date UTC. */
export function getLaunchAt(): Date {
  return new Date(getLaunchAtTimestamp());
}

/** Timestamp estable (ms) — usar como dependencia de hooks en lugar de `Date`. */
export function getLaunchAtTimestamp(): number {
  const iso = readLaunchAtIso();
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) {
    return new Date(DEFAULT_LAUNCH_AT_ISO).getTime();
  }
  return ms;
}

/** `true` mientras el lock esté habilitado y aún no haya llegado la fecha de apertura. */
export function isLaunchLockActive(now: Date = new Date()): boolean {
  if (!isLaunchLockEnabled()) return false;
  return now.getTime() < getLaunchAt().getTime();
}

/** Tiempo restante hacia el launch. Valores en 0 si ya pasó. */
export function getLaunchCountdown(
  now: Date = new Date(),
  launchAt: Date = getLaunchAt(),
): LaunchCountdown {
  const totalMs = Math.max(0, launchAt.getTime() - now.getTime());

  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, totalMs };
}

/** Etiqueta legible de la fecha de apertura en español Colombia. */
export function formatLaunchDateLabel(launchAt: Date = getLaunchAt()): string {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Bogota",
  }).format(launchAt);
}

/** Rutas que no muestran el modal bloqueante. */
export function isLaunchLockExemptRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname.startsWith("/admin") || pathname.startsWith("/login");
}
