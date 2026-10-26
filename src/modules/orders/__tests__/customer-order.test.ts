/** @jest-environment node */
import { isReportedToPos, toCustomerOrderView, type NeonOrderForCustomer } from "../domain/customer-order";
import { posCustomerOrderSchema } from "@/modules/posIntegration/contracts/pos-catalog.schema";

const neon: NeonOrderForCustomer = {
  id: "ord-1",
  orderNumber: "CV-ABC-1",
  status: "PAID",
  createdAt: new Date("2026-10-26T15:00:00Z"),
  updatedAt: new Date("2026-10-26T15:05:00Z"),
  total: 191000,
  subtotal: 180000,
  shippingCost: 11000,
  discount: 0,
  paymentMethod: "BOLD",
  paidAt: new Date("2026-10-26T15:04:00Z"),
  shippingName: "Juan Pérez",
  shippingAddress: "Calle 35 # 24-15",
  shippingCity: "Bucaramanga",
  shippingDepartment: "Santander",
  items: [
    {
      id: "it-1", variantId: "pos-vestido-lino-2-3", name: "Vestido lino", imageUrl: "https://img/vestido.jpg",
      colorName: "Verde", size: "M", quantity: 1, price: 150000,
    },
    { id: "it-2", variantId: "clxneon01", name: "Bolso web", imageUrl: "https://img/bolso.jpg", colorName: "Café", size: "U", quantity: 1, price: 30000 },
  ],
};

const pos = posCustomerOrderSchema.parse({
  orderNumber: "CV-ABC-1",
  saleNumber: "V-001420",
  status: "REGISTRADA",
  fulfillmentStatus: "SHIPPED",
  trackingNumber: "ENVIA-1",
  trackingUrl: "https://rastreo.test/1",
  paidAt: "2026-10-26T15:04:00Z",
  shippedAt: "2026-10-27T09:15:00Z",
  updatedAt: "2026-10-27T09:15:00Z",
  total: 191000,
  shippingName: "Mariana Gómez",
  shippingRateName: "Metropolitana Bucaramanga",
  address: "Calle 35 # 24-15",
  city: "Bucaramanga",
  department: "Santander",
  lines: [
    {
      productSlug: "VESTIDO-LINO", name: "Vestido Lino Floral", colorId: 2, colorName: "Verde militar", sizeId: 3,
      sizeName: "M", sku: "SKU-1", quantity: 1, unitPrice: 150000, discount: 0, lineTotal: 150000,
    },
  ],
});

describe("«Mis pedidos» con la logística del POS", () => {
  it("toma del POS el estado, la guía, el destinatario y las prendas (con la foto de la web)", () => {
    const view = toCustomerOrderView(neon, pos);
    expect(view.status).toBe("SHIPPED");
    expect(view.trackingCode).toBe("ENVIA-1");
    expect(view.trackingUrl).toBe("https://rastreo.test/1");
    expect(view.shippedAt).toBe("2026-10-27T09:15:00Z");
    expect(view.shippingAddress.fullName).toBe("Mariana Gómez");
    expect(view.shippingRateName).toBe("Metropolitana Bucaramanga");
    expect(view.total).toBe(191000);
    expect(view.items).toEqual([
      expect.objectContaining({ productName: "Vestido Lino Floral", color: "Verde militar", productImage: "https://img/vestido.jpg" }),
      // Producto que solo existe en la web: sigue en el pedido.
      expect.objectContaining({ id: "it-2", productName: "Bolso web" }),
    ]);
  });

  it("sin el POS muestra lo que sabe la web (pedido sin pagar o aún sin registrar)", () => {
    const view = toCustomerOrderView({ ...neon, status: "PENDING", paidAt: null }, null);
    expect(view.status).toBe("PENDING");
    expect(view.trackingCode).toBeUndefined();
    expect(view.shippedAt).toBeNull();
    expect(view.items).toHaveLength(2);
  });

  it("solo los pedidos pagados se buscan en el POS", () => {
    expect(isReportedToPos("PAID", new Date())).toBe(true);
    expect(isReportedToPos("REFUNDED", new Date())).toBe(true);
    expect(isReportedToPos("PENDING", null)).toBe(false);
    expect(isReportedToPos("FAILED", null)).toBe(false);
  });
});
