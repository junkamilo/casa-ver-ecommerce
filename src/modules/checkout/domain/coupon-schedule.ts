export type CouponScheduleMode = "NONE" | "SINGLE_DAY" | "DATE_RANGE";

export type CouponScheduleInput = {
  scheduleEnabled: boolean;
  scheduleMode?: "SINGLE_DAY" | "DATE_RANGE";
  singleDayDate?: string;
  startTime?: string;
  endTime?: string;
  fromDate?: string;
  toDate?: string;
};

export type CouponScheduleResult = {
  scheduleMode: CouponScheduleMode;
  validFrom: Date | null;
  validTo: Date | null;
};

export type CouponScheduleFields = {
  scheduleMode?: CouponScheduleMode | string | null;
  validFrom?: Date | string | null;
  validTo?: Date | string | null;
  expiresAt?: Date | string | null;
};

const BOGOTA_OFFSET = "-05:00";

export function bogotaInstant(date: string, time: string): Date {
  return new Date(`${date}T${time}:00${BOGOTA_OFFSET}`);
}

export function bogotaDayStart(date: string): Date {
  return bogotaInstant(date, "00:00");
}

export function bogotaDayEnd(date: string): Date {
  return new Date(`${date}T23:59:59.999${BOGOTA_OFFSET}`);
}

export function getBogotaTodayDate(now: Date = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
}

export function isDateBeforeTodayInBogota(date: string, now: Date = new Date()): boolean {
  return date < getBogotaTodayDate(now);
}

export function buildCouponSchedule(input: CouponScheduleInput): CouponScheduleResult {
  if (!input.scheduleEnabled) {
    return { scheduleMode: "NONE", validFrom: null, validTo: null };
  }

  if (input.scheduleMode === "SINGLE_DAY") {
    if (!input.singleDayDate || !input.startTime || !input.endTime) {
      throw new Error("Fecha y horas son obligatorias para un día específico");
    }
    return {
      scheduleMode: "SINGLE_DAY",
      validFrom: bogotaInstant(input.singleDayDate, input.startTime),
      validTo: bogotaInstant(input.singleDayDate, input.endTime),
    };
  }

  if (input.scheduleMode === "DATE_RANGE") {
    if (!input.fromDate || !input.toDate) {
      throw new Error("Las fechas de inicio y fin son obligatorias para el rango");
    }
    return {
      scheduleMode: "DATE_RANGE",
      validFrom: bogotaDayStart(input.fromDate),
      validTo: bogotaDayEnd(input.toDate),
    };
  }

  throw new Error("Modo de vigencia inválido");
}

export function formatCouponScheduleLabel(
  schedule: CouponScheduleFields
): string {
  const mode = schedule.scheduleMode ?? "NONE";

  if (mode === "NONE" || mode === null) {
    if (schedule.expiresAt) {
      const expiry =
        schedule.expiresAt instanceof Date
          ? schedule.expiresAt
          : new Date(schedule.expiresAt);
      return expiry.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "America/Bogota",
      });
    }
    return "Sin límite";
  }

  const validFrom = schedule.validFrom
    ? schedule.validFrom instanceof Date
      ? schedule.validFrom
      : new Date(schedule.validFrom)
    : null;
  const validTo = schedule.validTo
    ? schedule.validTo instanceof Date
      ? schedule.validTo
      : new Date(schedule.validTo)
    : null;

  if (!validFrom || !validTo) return "Sin límite";

  if (mode === "SINGLE_DAY") {
    const dateLabel = validFrom.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "America/Bogota",
    });
    const startTime = validFrom.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Bogota",
    });
    const endTime = validTo.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Bogota",
    });
    return `${dateLabel} · ${startTime}–${endTime}`;
  }

  const fromLabel = validFrom.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    timeZone: "America/Bogota",
  });
  const toLabel = validTo.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Bogota",
  });
  return `${fromLabel} – ${toLabel}`;
}
