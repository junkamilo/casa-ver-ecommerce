/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/modules/posIntegration/infrastructure/pos-reviews.client", () => ({
  getReviewToken: jest.fn(),
  submitReviewByToken: jest.fn(),
  submitProductReview: jest.fn(),
}));
jest.mock("@/auth", () => ({ auth: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/modules/catalog/product/infrastructure/prisma-product-detail.repository", () => {
  const repo = { getUserByEmail: jest.fn(), findPaidOrderForProduct: jest.fn() };
  return { PrismaProductDetailRepository: jest.fn(() => repo), __repo: repo };
});
jest.mock("@/modules/catalog/product/application/resolve-product-source", () => ({
  resolveProductSource: jest.fn(),
}));

import { GET, POST } from "@/app/api/reviews/[token]/route";
import { auth } from "@/auth";
import {
  getReviewToken,
  submitProductReview,
  submitReviewByToken,
} from "@/modules/posIntegration/infrastructure/pos-reviews.client";
import { resolveProductSource } from "@/modules/catalog/product/application/resolve-product-source";
import { saveReviewUseCase } from "@/modules/catalog/product/application/save-review.use-case";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const repo = require("@/modules/catalog/product/infrastructure/prisma-product-detail.repository").__repo;
const params = (token: string) => ({ params: Promise.resolve({ token }) });
const mockGetToken = getReviewToken as jest.Mock;
const mockSubmitToken = submitReviewByToken as jest.Mock;
const mockSubmitProduct = submitProductReview as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe("enlace del correo (/api/reviews/[token])", () => {
  it("devuelve el producto y el pedido que informa el POS", async () => {
    mockGetToken.mockResolvedValue({
      ok: true,
      data: { productSlug: "blusa-lino", productName: "Blusa Lino", orderNumber: "CV-1", customerName: "María" },
    });
    const res = await GET(new Request("http://x"), params("abc"));
    expect(await res.json()).toEqual({
      productId: "blusa-lino",
      productName: "Blusa Lino",
      productSlug: "blusa-lino",
      orderNumber: "CV-1",
      reviewerName: "María",
    });
  });

  it("un enlace usado o vencido responde 410 con el mensaje del POS", async () => {
    mockGetToken.mockResolvedValue({ ok: false, status: 409, message: "Este enlace ya fue utilizado" });
    const res = await GET(new Request("http://x"), params("abc"));
    expect(res.status).toBe(410);
    expect(await res.json()).toEqual({ error: "Este enlace ya fue utilizado" });
  });

  it("valida antes de enviar y reenvía la reseña al POS", async () => {
    const bad = await POST(
      new Request("http://x", { method: "POST", body: JSON.stringify({ rating: 5, comment: "ok" }) }),
      params("abc"),
    );
    expect(bad.status).toBe(400);
    expect(mockSubmitToken).not.toHaveBeenCalled();

    mockSubmitToken.mockResolvedValue({ ok: true, data: { reviewId: "r-1", status: "PENDING" } });
    const res = await POST(
      new Request("http://x", { method: "POST", body: JSON.stringify({ rating: 4, comment: " Muy linda " }) }),
      params("abc"),
    );
    expect(await res.json()).toEqual({ success: true, reviewId: "r-1" });
    expect(mockSubmitToken).toHaveBeenCalledWith("abc", { rating: 4, comment: "Muy linda" });
  });
});

describe("reseña desde la ficha (saveReviewUseCase)", () => {
  beforeEach(() => {
    (auth as jest.Mock).mockResolvedValue({ user: { email: "maria@correo.co" } });
    repo.getUserByEmail.mockResolvedValue({ id: "u1", name: "María Gómez" });
    (resolveProductSource as jest.Mock).mockResolvedValue({ source: "POS", pos: { name: "Blusa Lino " }, overlay: null });
  });

  it("sin pedido pagado con el producto no se envía", async () => {
    repo.findPaidOrderForProduct.mockResolvedValue(null);
    const result = await saveReviewUseCase("blusa-lino", { rating: 5, comment: "Linda" });
    expect(result.success).toBe(false);
    expect(mockSubmitProduct).not.toHaveBeenCalled();
  });

  it("envía al POS con el número del pedido, el nombre y el correo de la clienta", async () => {
    repo.findPaidOrderForProduct.mockResolvedValue({ orderNumber: "CV-9", shippingName: "María G" });
    mockSubmitProduct.mockResolvedValue({ ok: true, data: { reviewId: "r-2", status: "PENDING" } });

    expect(await saveReviewUseCase("blusa-lino", { rating: 5, comment: "" } as never)).toEqual({ success: true });
    expect(mockSubmitProduct).toHaveBeenCalledWith({
      orderNumber: "CV-9",
      productSlug: "blusa-lino",
      productName: "Blusa Lino",
      customerName: "María Gómez",
      customerEmail: "maria@correo.co",
      rating: 5,
      comment: "",
    });
  });

  it("si el POS la rechaza muestra su mensaje", async () => {
    repo.findPaidOrderForProduct.mockResolvedValue({ orderNumber: "CV-9", shippingName: null });
    mockSubmitProduct.mockResolvedValue({ ok: false, status: 400, message: "El comentario no puede superar 1000 caracteres" });
    expect(await saveReviewUseCase("blusa-lino", { rating: 5, comment: "x" })).toEqual({
      success: false,
      error: "El comentario no puede superar 1000 caracteres",
    });
  });
});
