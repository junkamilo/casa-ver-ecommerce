import {
  FREE_SHIPPING_MIN_NET_SUBTOTAL,
  SHIPPING_NATIONAL,
  resolveShippingQuote,
} from "../shipping";

describe("resolveShippingQuote", () => {
  const nationalCity = { city: "Bogotá", department: "Cundinamarca" };

  it("otorga envío gratis cuando el neto es exactamente el umbral", () => {
    const quote = resolveShippingQuote({
      netSubtotal: FREE_SHIPPING_MIN_NET_SUBTOTAL,
      ...nationalCity,
    });
    expect(quote.cost).toBe(0);
    expect(quote.isFreeByThreshold).toBe(true);
    expect(quote.isPendingAddress).toBe(false);
    expect(quote.baseCost).toBe(SHIPPING_NATIONAL);
  });

  it("cobra envío nacional cuando el neto está por debajo del umbral", () => {
    const quote = resolveShippingQuote({
      netSubtotal: FREE_SHIPPING_MIN_NET_SUBTOTAL - 1,
      ...nationalCity,
    });
    expect(quote.cost).toBe(SHIPPING_NATIONAL);
    expect(quote.isFreeByThreshold).toBe(false);
    expect(quote.isPendingAddress).toBe(false);
  });

  it("cobra envío cuando un cupón baja el neto por debajo del umbral", () => {
    const quote = resolveShippingQuote({
      netSubtotal: 280_000,
      ...nationalCity,
    });
    expect(quote.cost).toBe(SHIPPING_NATIONAL);
    expect(quote.isFreeByThreshold).toBe(false);
  });

  it("otorga envío gratis sin dirección si el neto califica", () => {
    const quote = resolveShippingQuote({ netSubtotal: 320_000 });
    expect(quote.cost).toBe(0);
    expect(quote.isFreeByThreshold).toBe(true);
    expect(quote.isPendingAddress).toBe(false);
    expect(quote.baseCost).toBeNull();
  });

  it("marca envío pendiente sin dirección cuando no califica gratis", () => {
    const quote = resolveShippingQuote({ netSubtotal: 100_000 });
    expect(quote.cost).toBe(0);
    expect(quote.isFreeByThreshold).toBe(false);
    expect(quote.isPendingAddress).toBe(true);
    expect(quote.baseCost).toBeNull();
  });
});
