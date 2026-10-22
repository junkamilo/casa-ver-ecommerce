/** @jest-environment node */
import { posOrderStatusSchema, posWebhookPayloadSchema } from "../contracts/pos-catalog.schema";
import { decideWebStatusFromPos, posStatusFromWeb } from "../domain/pos-order-status";

describe("estado de pedidos entre el POS y la web", () => {
  it("avanza el pedido de la web con el estado del POS, sin retroceder", () => {
    expect(decideWebStatusFromPos("PAID", "PROCESSING")).toBe("PROCESSING");
    expect(decideWebStatusFromPos("PAID", "SHIPPED")).toBe("SHIPPED");
    expect(decideWebStatusFromPos("SHIPPED", "DELIVERED")).toBe("DELIVERED");
    // Aviso viejo o repetido: no cambia.
    expect(decideWebStatusFromPos("SHIPPED", "PROCESSING")).toBeNull();
    expect(decideWebStatusFromPos("SHIPPED", "SHIPPED")).toBeNull();
    expect(decideWebStatusFromPos("PROCESSING", "PAID")).toBeNull();
  });

  it("cancelar o reembolsar en el POS cancela el pedido pagado de la web", () => {
    expect(decideWebStatusFromPos("PAID", "CANCELLED")).toBe("CANCELLED");
    expect(decideWebStatusFromPos("DELIVERED", "REFUNDED")).toBe("REFUNDED");
  });

  it("no toca pedidos sin pagar, fallidos o ya finales", () => {
    expect(decideWebStatusFromPos("PENDING", "SHIPPED")).toBeNull();
    expect(decideWebStatusFromPos("FAILED", "CANCELLED")).toBeNull();
    expect(decideWebStatusFromPos("CANCELLED", "REFUNDED")).toBeNull();
    expect(decideWebStatusFromPos("PAID", null)).toBeNull();
  });

  it("solo los estados logísticos de la web se reportan al POS", () => {
    expect(posStatusFromWeb("PROCESSING")).toBe("PROCESSING");
    expect(posStatusFromWeb("SHIPPED")).toBe("SHIPPED");
    expect(posStatusFromWeb("DELIVERED")).toBe("DELIVERED");
    expect(posStatusFromWeb("PAID")).toBeNull();
    expect(posStatusFromWeb("CANCELLED")).toBeNull();
  });

  it("acepta el aviso order.status_changed y el estado del POS", () => {
    expect(
      posWebhookPayloadSchema.parse({
        eventId: "e-1", event: "order.status_changed", entityType: "order", id: "CV-ORD-1", action: "status_changed",
      }).entityType,
    ).toBe("order");
    const status = posOrderStatusSchema.parse({
      orderNumber: "CV-ORD-1",
      status: "REGISTRADA",
      saleNumber: "CV-000200",
      saleStatus: "COMPLETED",
      fulfillmentStatus: "SHIPPED",
      trackingNumber: "GUIA-1",
      trackingUrl: null,
      shippedAt: "2026-10-15T18:00:00Z",
      deliveredAt: null,
      updatedAt: "2026-10-15T18:00:00Z",
      rejectReason: null,
      lastError: null,
    });
    expect(status.fulfillmentStatus).toBe("SHIPPED");
    expect(status.trackingNumber).toBe("GUIA-1");
  });
});
