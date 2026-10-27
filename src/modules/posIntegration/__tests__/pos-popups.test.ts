/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/modules/posIntegration/infrastructure/pos-popups.client", () => ({ fetchActivePopup: jest.fn() }));

import { NextRequest } from "next/server";
import { GET } from "@/app/api/promo-popups/active/route";
import { fetchActivePopup } from "@/modules/posIntegration/infrastructure/pos-popups.client";
import { posActivePopupSchema } from "../contracts/pos-popups.schema";

const mockFetch = fetchActivePopup as jest.Mock;
const request = (placement: string) => new NextRequest(`http://x/api/promo-popups/active?placement=${placement}`);

const popup = posActivePopupSchema.parse({
  id: "4f1c0c1e-0000-0000-0000-000000000001",
  placement: "HOME",
  headline: "10% OFF",
  subtitle: "en tu primera compra",
  couponCode: "MIPRIMERACOMPRA",
  disclaimer: "Descuento exclusivo por tiempo limitado.",
  ctaText: "COMPRAR AHORA",
  ctaUrl: "/tienda",
  delaySeconds: 5,
  validTo: null,
});

beforeEach(() => jest.clearAllMocks());

describe("/api/promo-popups/active", () => {
  it("entrega el popup vigente que decide el POS", async () => {
    mockFetch.mockResolvedValue(popup);
    const res = await GET(request("home"));
    expect(mockFetch).toHaveBeenCalledWith("HOME");
    expect(await res.json()).toEqual({ data: popup });
  });

  it("sin popup vigente o con el POS caído no muestra nada", async () => {
    mockFetch.mockResolvedValueOnce(null);
    expect(await (await GET(request("PRODUCT"))).json()).toEqual({ data: null });

    mockFetch.mockRejectedValueOnce(new Error("timeout"));
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(await (await GET(request("CHECKOUT"))).json()).toEqual({ data: null });
  });

  it("una ubicación inválida responde 400 sin consultar al POS", async () => {
    const res = await GET(request("FOOTER"));
    expect(res.status).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
