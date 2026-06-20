import type { Period } from "../contracts/stats.dto";

const COLOMBIA_OFFSET_MS = 5 * 60 * 60 * 1000;
const DAY_NAMES = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"] as const;

const nowColombia = () => new Date(Date.now() - COLOMBIA_OFFSET_MS);
const colombiaToUTC = (d: Date) => new Date(d.getTime() + COLOMBIA_OFFSET_MS);

export function getPeriodDateRange(period: Period): {
  start: Date;
  end: Date;
  durationMs: number;
} {
  const now = nowColombia();
  const endLocal = new Date(now);
  endLocal.setUTCHours(23, 59, 59, 999);

  const startLocal = new Date(now);
  switch (period) {
    case "day":
      startLocal.setUTCHours(0, 0, 0, 0);
      break;
    case "week": {
      const dayOfWeek = startLocal.getUTCDay();
      const daysBack = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startLocal.setUTCDate(startLocal.getUTCDate() - daysBack);
      startLocal.setUTCHours(0, 0, 0, 0);
      break;
    }
    case "month":
      startLocal.setUTCDate(1);
      startLocal.setUTCHours(0, 0, 0, 0);
      break;
  }

  const start = colombiaToUTC(startLocal);
  const end = colombiaToUTC(endLocal);
  return { start, end, durationMs: end.getTime() - start.getTime() };
}

export function toColombiaDate(date: Date | string): Date {
  return new Date(new Date(date).getTime() - COLOMBIA_OFFSET_MS);
}

export function toDayLabel(date: Date | string): string {
  const localDate = toColombiaDate(date);
  return `${localDate.getUTCDate()}-${DAY_NAMES[localDate.getUTCDay()]}`;
}

export function calculatePercentageChange(current: number, previous: number): string {
  if (previous === 0 && current === 0) return "0%";
  if (previous === 0) return "+100%";
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? "+" : ""}${Math.round(change)}%`;
}
