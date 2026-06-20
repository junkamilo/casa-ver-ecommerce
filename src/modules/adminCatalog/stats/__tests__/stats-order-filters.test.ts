/** @jest-environment node */

import {
  REVENUE_ORDER_STATUSES,
  buildRevenueOrderItemWhere,
  buildRevenueOrderWhere,
} from "@/modules/adminCatalog/stats/domain/stats-order-filters";
import { getPeriodDateRange } from "@/modules/adminCatalog/stats/domain/stats-period";

describe("stats order filters", () => {
  it("buildRevenueOrderWhere incluye estados de ventas confirmadas", () => {
    const start = new Date("2026-06-01T00:00:00.000Z");
    const end = new Date("2026-06-07T23:59:59.999Z");

    expect(REVENUE_ORDER_STATUSES).toEqual([
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
    ]);
    expect(buildRevenueOrderWhere(start, end)).toEqual({
      status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
      createdAt: { gte: start, lte: end },
    });
    expect(buildRevenueOrderItemWhere(start, end)).toEqual({
      order: {
        status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: start, lte: end },
      },
    });
  });
});

describe("stats period range", () => {
  beforeEach(() => {
    jest.spyOn(Date, "now").mockReturnValue(new Date("2026-06-11T15:00:00.000Z").getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("calcula rango de dia en hora Colombia", () => {
    const range = getPeriodDateRange("day");
    expect(range.start.toISOString()).toBe("2026-06-11T05:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-06-12T04:59:59.999Z");
  });

  it("calcula rango semanal desde lunes", () => {
    const range = getPeriodDateRange("week");
    expect(range.start.toISOString()).toBe("2026-06-08T05:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-06-12T04:59:59.999Z");
  });

  it("calcula rango mensual desde el primer dia", () => {
    const range = getPeriodDateRange("month");
    expect(range.start.toISOString()).toBe("2026-06-01T05:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-06-12T04:59:59.999Z");
  });
});
