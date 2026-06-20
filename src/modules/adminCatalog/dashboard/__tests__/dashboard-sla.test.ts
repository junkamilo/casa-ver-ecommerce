/** @jest-environment node */

import { buildSlaQueueItem, sortSlaQueue } from "@/modules/adminCatalog/dashboard/domain/dashboard-sla";

describe("dashboard SLA domain", () => {
  const now = new Date("2026-06-11T12:00:00.000Z");

  it("marca PAID como warning tras 30 minutos", () => {
    const item = buildSlaQueueItem(
      {
        id: "o1",
        orderNumber: "CV-001",
        status: "PAID",
        total: 100000,
        paidAt: new Date("2026-06-11T11:20:00.000Z"),
        shippedAt: null,
        updatedAt: new Date("2026-06-11T11:20:00.000Z"),
        createdAt: new Date("2026-06-11T11:15:00.000Z"),
        user: { name: "Ana" },
      },
      now
    );

    expect(item?.severity).toBe("warning");
    expect(item?.suggestedAction).toBe("Preparar envío");
  });

  it("ordena critical antes que warning", () => {
    const sorted = sortSlaQueue([
      {
        orderId: "1",
        orderNumber: "A",
        status: "PAID",
        statusLabel: "Por enviar",
        waitingMinutes: 45,
        waitingLabel: "45 min",
        severity: "warning",
        suggestedAction: "Preparar envío",
        customerName: null,
        total: 1,
      },
      {
        orderId: "2",
        orderNumber: "B",
        status: "PAID",
        statusLabel: "Por enviar",
        waitingMinutes: 150,
        waitingLabel: "2 h",
        severity: "critical",
        suggestedAction: "Preparar envío",
        customerName: null,
        total: 1,
      },
    ]);

    expect(sorted[0]?.severity).toBe("critical");
  });
});
