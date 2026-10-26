/** @jest-environment node */
import { posOrderStatusSchema, posWebhookPayloadSchema } from "../contracts/pos-catalog.schema";
import { decideWebStatusFromPos } from "../domain/pos-order-status";

describe("estado de pedidos entre el POS y la web", () => {
  it("la logística del POS no se copia a la web (se lee del POS)", () => {
    expect(decideWebStatusFromPos("PAID", "PROCESSING")).toBeNull();
    expect(decideWebStatusFromPos("PAID", "SHIPPED")).toBeNull();
    expect(decideWebStatusFromPos("PAID", "DELIVERED")).toBeNull();
    expect(decideWebStatusFromPos("PAID", null)).toBeNull();
  });

  it("cancelar o reembolsar en el POS cancela el pedido pagado de la web", () => {
    expect(decideWebStatusFromPos("PAID", "CANCELLED")).toBe("CANCELLED");
    expect(decideWebStatusFromPos("PAID", "REFUNDED")).toBe("REFUNDED");
    // Pedidos viejos que la web alcanzó a mover de estado.
    expect(decideWebStatusFromPos("DELIVERED", "REFUNDED")).toBe("REFUNDED");
  });

  it("no toca pedidos sin pagar, fallidos o ya finales", () => {
    expect(decideWebStatusFromPos("PENDING", "CANCELLED")).toBeNull();
    expect(decideWebStatusFromPos("FAILED", "CANCELLED")).toBeNull();
    expect(decideWebStatusFromPos("CANCELLED", "REFUNDED")).toBeNull();
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
