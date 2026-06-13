/** @jest-environment node */

import {
  buildMinuteOptions,
  compareTimes24,
  formatDateDisplay,
  formatTimeDisplay24to12,
  getCalendarDays,
  isDateBefore,
  parseTime24to12Parts,
  parseTimeDisplay12to24,
  toIsoDate,
} from "../date-time.utils";

describe("date-time.utils", () => {
  it("formatDateDisplay formatea YYYY-MM-DD a dd/mm/yyyy", () => {
    expect(formatDateDisplay("2026-06-15")).toBe("15/06/2026");
  });

  it("toIsoDate construye fecha con padding", () => {
    expect(toIsoDate(2026, 5, 3)).toBe("2026-06-03");
  });

  it("isDateBefore compara strings ISO", () => {
    expect(isDateBefore("2026-06-14", "2026-06-15")).toBe(true);
    expect(isDateBefore("2026-06-15", "2026-06-15")).toBe(false);
  });

  it("getCalendarDays devuelve múltiplos de 7 celdas", () => {
    const days = getCalendarDays(2026, 5);
    expect(days.length % 7).toBe(0);
    expect(days.length).toBeGreaterThanOrEqual(28);
  });

  it("formatTimeDisplay24to12 convierte a 12h AM/PM", () => {
    expect(formatTimeDisplay24to12("09:00")).toBe("9:00 AM");
    expect(formatTimeDisplay24to12("00:00")).toBe("12:00 AM");
    expect(formatTimeDisplay24to12("12:00")).toBe("12:00 PM");
    expect(formatTimeDisplay24to12("13:30")).toBe("1:30 PM");
  });

  it("parseTimeDisplay12to24 convierte de 12h a 24h", () => {
    expect(parseTimeDisplay12to24(9, 0, "AM")).toBe("09:00");
    expect(parseTimeDisplay12to24(12, 0, "AM")).toBe("00:00");
    expect(parseTimeDisplay12to24(12, 0, "PM")).toBe("12:00");
    expect(parseTimeDisplay12to24(1, 30, "PM")).toBe("13:30");
  });

  it("parseTime24to12Parts es inverso consistente", () => {
    const parts = parseTime24to12Parts("13:45");
    expect(parts).toEqual({ hour12: 1, minute: 45, period: "PM" });
    expect(parseTimeDisplay12to24(parts!.hour12, parts!.minute, parts!.period)).toBe(
      "13:45"
    );
  });

  it("compareTimes24 ordena horas", () => {
    expect(compareTimes24("09:00", "18:00")).toBeLessThan(0);
    expect(compareTimes24("18:00", "09:00")).toBeGreaterThan(0);
  });

  it("buildMinuteOptions respeta step", () => {
    expect(buildMinuteOptions(5)).toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
  });
});
