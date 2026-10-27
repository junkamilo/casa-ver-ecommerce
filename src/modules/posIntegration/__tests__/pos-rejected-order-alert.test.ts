/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/lib/prisma", () => ({ prisma: { order: { findUnique: jest.fn(), update: jest.fn() } } }));
jest.mock("@/services/email", () => ({ sendPosRejectedOrderAdminEmail: jest.fn() }));
jest.mock("../infrastructure/pos-catalog.client", () => ({
  isPosCatalogConfigured: jest.fn(() => true),
  postOrder: jest.fn(),
  postOrderCancellation: jest.fn(),
}));

import { prisma } from "@/lib/prisma";
import { sendPosRejectedOrderAdminEmail } from "@/services/email";
import { postOrder } from "../infrastructure/pos-catalog.client";
import { reportPaidOrderToPos } from "../application/report-order-to-pos.use-case";

const mockFind = prisma.order.findUnique as jest.Mock;
const mockUpdate = prisma.order.update as jest.Mock;
const mockEmail = sendPosRejectedOrderAdminEmail as jest.Mock;
const mockPost = postOrder as jest.Mock;

function order(overrides: Record<string, unknown> = {}) {
  return {
    id: "o1",
    orderNumber: "CV-1",
    paidAt: new Date("2026-10-27T10:00:00Z"),
    paymentMethod: "BOLD",
    paymentId: "p1",
    transactionId: "t1",
    shippingName: "María Gómez",
    shippingRateName: null,
    shippingCedula: "123",
    shippingPhone: "300",
    shippingCity: "Bucaramanga",
    shippingDepartment: "Santander",
    shippingAddress: "Calle 1",
    shippingCost: 0,
    discount: 0,
    total: 89000,
    couponCode: null,
    posPromotionId: null,
    couponDiscountType: null,
    couponDiscountValue: null,
    posRejectedAlertSentAt: null,
    user: { email: "maria@correo.co", name: "María" },
    items: [
      {
        productId: "blusa-lino",
        variantId: "pos-blusa-lino-1-2",
        sku: "pos-blusa-lino-1-2",
        price: 89000,
        quantity: 1,
        name: "Blusa",
        colorName: "Arena",
        size: "M",
        couponDiscount: 0,
      },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => undefined);
  mockPost.mockResolvedValue({ status: "rejected", httpStatus: 409, message: "Blusa: agotado" });
});

describe("pedido pagado que el POS rechaza", () => {
  it("avisa al admin por correo y marca el pedido", async () => {
    mockFind.mockResolvedValue(order());
    mockEmail.mockResolvedValue({ success: true });

    expect(await reportPaidOrderToPos("o1")).toEqual({ status: "rejected", message: "Blusa: agotado" });
    expect(mockEmail).toHaveBeenCalledWith(
      expect.objectContaining({ orderNumber: "CV-1", reason: "Blusa: agotado", customerEmail: "maria@correo.co", total: 89000 }),
    );
    expect(mockUpdate).toHaveBeenCalledWith({ where: { id: "o1" }, data: { posRejectedAlertSentAt: expect.any(Date) } });
  });

  it("no repite la alerta y, si el correo falla, lo reintenta en la próxima pasada", async () => {
    mockFind.mockResolvedValue(order({ posRejectedAlertSentAt: new Date() }));
    await reportPaidOrderToPos("o1");
    expect(mockEmail).not.toHaveBeenCalled();

    mockFind.mockResolvedValue(order());
    mockEmail.mockResolvedValue({ success: false, error: "smtp" });
    await reportPaidOrderToPos("o1");
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
