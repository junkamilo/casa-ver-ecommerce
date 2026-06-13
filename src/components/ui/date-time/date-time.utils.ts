import { getBogotaTodayDate } from "@/modules/checkout/domain/coupon-schedule";

export type CalendarDay = {
  iso: string;
  day: number;
  inMonth: boolean;
};

export type TimePeriod = "AM" | "PM";

export const MONTH_NAMES_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

export const WEEKDAY_LABELS_ES = ["L", "M", "X", "J", "V", "S", "D"] as const;

export function getBogotaTodayIso(now: Date = new Date()): string {
  return getBogotaTodayDate(now);
}

export function toIsoDate(year: number, monthIndex: number, day: number): string {
  const y = String(year);
  const m = String(monthIndex + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(iso: string): { year: number; monthIndex: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  return {
    year: Number(match[1]),
    monthIndex: Number(match[2]) - 1,
    day: Number(match[3]),
  };
}

export function formatDateDisplay(iso: string): string {
  const parsed = parseIsoDate(iso);
  if (!parsed) return "";
  const d = String(parsed.day).padStart(2, "0");
  const m = String(parsed.monthIndex + 1).padStart(2, "0");
  return `${d}/${m}/${parsed.year}`;
}

export function isDateBefore(iso: string, minIso: string): boolean {
  return iso < minIso;
}

export function getCalendarDays(year: number, monthIndex: number): CalendarDay[] {
  const firstDay = new Date(year, monthIndex, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const cells: CalendarDay[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNumber = i - startOffset + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) {
      const date = new Date(year, monthIndex, dayNumber);
      cells.push({
        iso: toIsoDate(date.getFullYear(), date.getMonth(), date.getDate()),
        day: date.getDate(),
        inMonth: false,
      });
    } else {
      cells.push({
        iso: toIsoDate(year, monthIndex, dayNumber),
        day: dayNumber,
        inMonth: true,
      });
    }
  }
  return cells;
}

export function formatTimeDisplay24to12(hhmm: string): string {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(hhmm);
  if (!match) return "";
  let hour = Number(match[1]);
  const minute = match[2];
  const period: TimePeriod = hour >= 12 ? "PM" : "AM";
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${minute} ${period}`;
}

export function parseTime24to12Parts(hhmm: string): {
  hour12: number;
  minute: number;
  period: TimePeriod;
} | null {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(hhmm);
  if (!match) return null;
  const hour24 = Number(match[1]);
  const minute = Number(match[2]);
  const period: TimePeriod = hour24 >= 12 ? "PM" : "AM";
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, minute, period };
}

export function parseTimeDisplay12to24(
  hour12: number,
  minute: number,
  period: TimePeriod
): string {
  let hour24 = hour12 % 12;
  if (period === "PM") hour24 += 12;
  if (period === "AM" && hour12 === 12) hour24 = 0;
  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function compareTimes24(a: string, b: string): number {
  const [ah, am] = a.split(":").map(Number);
  const [bh, bm] = b.split(":").map(Number);
  return ah * 60 + am - (bh * 60 + bm);
}

export function buildMinuteOptions(step: number): number[] {
  const options: number[] = [];
  for (let m = 0; m < 60; m += step) {
    options.push(m);
  }
  return options;
}

export const HOUR_OPTIONS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
