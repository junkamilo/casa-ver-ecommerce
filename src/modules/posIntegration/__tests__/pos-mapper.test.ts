/** @jest-environment node */
import { posProductSchema } from "../contracts/pos-catalog.schema";
import {
  POS_STOCK_AVAILABLE,
  POS_STOCK_LOW,
  buildPosOrderPayload,
  parsePosLineId,
  parsePosVariantSku,
  mapPosProduct,
  mapPosSize,
  normalizeHex,
  resolveComparePrice,
} from "../domain/pos-mapper";

function product(overrides: Record<string, unknown> = {}) {
  return posProductSchema.parse({
    slug: "blusa-lino",
    name: " Blusa Lino ",
    description: null,
    salePrice: "89900",
    displayPrice: 120000,
    coverImageUrl: null,
    videoUrl: null,
    categoryWebId: "cat-mujer",
    subcategoryWebId: "sub-blusas",
    available: true,
    colors: [
      {
        colorId: 1,
        name: "Beige",
        hexCode: "e5d3b3",
        media: [
          { url: "https://img/beige-1.jpg", video: false, cover: false },
          { url: "https://img/beige.mp4", video: true, cover: false },
          { url: "https://img/beige-2.jpg", video: false, cover: true },
        ],
      },
      { colorId: 2, name: "Negro", hexCode: "#000000", media: [] },
    ],
    sizes: [
      { sizeId: 10, name: "S" },
      { sizeId: 11, name: "M" },
      { sizeId: 12, name: "Talla Única" },
      { sizeId: 13, name: "38" },
    ],
    variants: [
      { colorId: 1, sizeId: 10, available: true, lowStock: false },
      { colorId: 1, sizeId: 11, available: true, lowStock: true },
      { colorId: 2, sizeId: 12, available: false, lowStock: false },
      { colorId: 2, sizeId: 13, available: true, lowStock: false },
      { colorId: 99, sizeId: 10, available: true, lowStock: false },
    ],
    updatedAt: null,
    ...overrides,
  });
}

describe("mapPosSize", () => {
  it("traduce tallas y alias", () => {
    expect(mapPosSize("m")).toBe("M");
    expect(mapPosSize("2XL")).toBe("XXL");
    expect(mapPosSize("Talla Única")).toBe("ONESIZE");
    expect(mapPosSize(" one  size ")).toBe("ONESIZE");
  });

  it("devuelve null si no hay equivalente", () => {
    expect(mapPosSize("38")).toBeNull();
    expect(mapPosSize(null)).toBeNull();
  });
});

describe("helpers", () => {
  it("normalizeHex agrega # y usa un valor por defecto", () => {
    expect(normalizeHex("abc123")).toBe("#ABC123");
    expect(normalizeHex("rojo")).toBe("#CCCCCC");
  });

  it("resolveComparePrice solo usa displayPrice si es mayor", () => {
    expect(resolveComparePrice(100, 150)).toBe(150);
    expect(resolveComparePrice(100, 100)).toBeNull();
    expect(resolveComparePrice(100, null)).toBeNull();
  });
});

describe("mapPosProduct", () => {
  it("mapea precios, categorías, portada y video", () => {
    const mapped = mapPosProduct(product());
    expect(mapped.posSlug).toBe("blusa-lino");
    expect(mapped.name).toBe("Blusa Lino");
    expect(mapped.basePrice).toBe(89900);
    expect(mapped.comparePrice).toBe(120000);
    expect(mapped.categoryWebIds).toEqual(["cat-mujer", "sub-blusas"]);
    expect(mapped.coverImageUrl).toBe("https://img/beige-2.jpg");
    expect(mapped.videoUrl).toBe("https://img/beige.mp4");
  });

  it("excluye videos de las imágenes del color", () => {
    const beige = mapPosProduct(product()).colors[0];
    expect(beige.hexCode).toBe("#E5D3B3");
    expect(beige.images.map((i) => i.url)).toEqual(["https://img/beige-1.jpg", "https://img/beige-2.jpg"]);
  });

  it("traduce la disponibilidad a stock nominal", () => {
    const [beige, negro] = mapPosProduct(product()).colors;
    expect(beige.variants).toEqual([
      expect.objectContaining({ size: "S", posAvailable: true, posLowStock: false, stock: POS_STOCK_AVAILABLE }),
      expect.objectContaining({ size: "M", posAvailable: true, posLowStock: true, stock: POS_STOCK_LOW }),
    ]);
    expect(negro.variants).toEqual([
      expect.objectContaining({ size: "ONESIZE", posAvailable: false, posLowStock: false, stock: 0 }),
    ]);
    expect(beige.variants[0].sku).toBe("pos-blusa-lino-1-10");
  });

  it("descarta variantes sin talla o color equivalente", () => {
    const { skipped } = mapPosProduct(product());
    expect(skipped).toHaveLength(2);
    expect(skipped.some((s) => s.includes("38"))).toBe(true);
    expect(skipped.some((s) => s.includes("99"))).toBe(true);
  });

  it("fusiona tallas del POS que caen en la misma talla web", () => {
    const mapped = mapPosProduct(
      product({
        colors: [{ colorId: 1, name: "Beige", hexCode: null, media: [] }],
        sizes: [
          { sizeId: 1, name: "XXL" },
          { sizeId: 2, name: "2XL" },
        ],
        variants: [
          { colorId: 1, sizeId: 1, available: true, lowStock: true },
          { colorId: 1, sizeId: 2, available: true, lowStock: false },
        ],
      }),
    );
    expect(mapped.colors[0].variants).toEqual([
      expect.objectContaining({ size: "XXL", posAvailable: true, posLowStock: false, stock: POS_STOCK_AVAILABLE }),
    ]);
  });

  it("marca pocas unidades si ninguna talla fusionada tiene stock holgado", () => {
    const mapped = mapPosProduct(
      product({
        colors: [{ colorId: 1, name: "Beige", hexCode: null, media: [] }],
        sizes: [
          { sizeId: 1, name: "XXL" },
          { sizeId: 2, name: "2XL" },
        ],
        variants: [
          { colorId: 1, sizeId: 1, available: false, lowStock: false },
          { colorId: 1, sizeId: 2, available: true, lowStock: true },
        ],
      }),
    );
    expect(mapped.colors[0].variants[0]).toEqual(
      expect.objectContaining({ posAvailable: true, posLowStock: true, stock: POS_STOCK_LOW }),
    );
  });

  it("hace únicos los nombres de color repetidos", () => {
    const mapped = mapPosProduct(
      product({
        colors: [
          { colorId: 1, name: "Azul", hexCode: null, media: [] },
          { colorId: 2, name: "azul", hexCode: null, media: [] },
        ],
        variants: [],
      }),
    );
    expect(mapped.colors.map((c) => c.name)).toEqual(["Azul", "azul 2"]);
  });
});

describe("ubicaciones, etiquetas y slug", () => {
  it("une la clasificación principal con las adicionales y sus tipos de prenda", () => {
    const mapped = mapPosProduct(
      product({
        classifications: [
          { categoryWebId: "cat-mujer", subcategoryWebId: "sub-blusas", garmentTypeSlug: "Blusa", primary: true },
          { categoryWebId: "cat-verano", subcategoryWebId: "sub-sets", garmentTypeSlug: "pantalon", primary: false },
        ],
      }),
    );
    expect(mapped.categoryWebIds).toEqual(["cat-mujer", "sub-blusas", "cat-verano", "sub-sets"]);
    expect(mapped.garmentTypeSlugs).toEqual(["blusa", "pantalon"]);
  });

  it("traduce las etiquetas del POS a las banderas de la web", () => {
    const mapped = mapPosProduct(
      product({
        labels: [
          { code: "PRODUCT_NEW", assignedAt: "2026-09-28T10:00:00Z" },
          { code: "SUGGEST_POPUP", assignedAt: null },
        ],
      }),
    );
    expect(mapped.labels.isFeatured).toBe(false);
    expect(mapped.labels.isProductNew).toBe(true);
    expect(mapped.labels.isProductNewAt?.toISOString()).toBe("2026-09-28T10:00:00.000Z");
    expect(mapped.labels.isSuggested).toBe(true);
    expect(mapped.labels.suggestedAt).toBeInstanceOf(Date);
    expect(mapPosProduct(product()).labels).toEqual(
      expect.objectContaining({ isFeatured: false, isProductNew: false, isSuggested: false }),
    );
  });

  it("guarda el slug del POS en minúsculas", () => {
    const mapped = mapPosProduct(product({ slug: "SET-VENUS" }));
    expect(mapped.posSlug).toBe("set-venus");
    expect(mapped.colors[0].variants[0].sku).toBe("pos-set-venus-1-10");
  });
});

describe("pedidos hacia el POS", () => {
  const order = {
    orderNumber: "ORD-001",
    shippingName: "Laura Gómez",
    shippingCedula: "1098",
    shippingPhone: "300",
    shippingCity: "Bucaramanga",
    shippingAddress: "Calle 1",
    email: "laura@correo.co",
    shippingCost: 11000,
    discount: 5000,
    items: [
      { productId: "p-pos", sku: "pos-SET-VENUS-3-12", price: 60000, quantity: 2 },
      { productId: "p-web", sku: "WEB-SKU-1", price: 50000, quantity: 1 },
    ],
  };

  it("lee color y talla del SKU de la variante del POS", () => {
    expect(parsePosVariantSku("pos-set-venus-3-12")).toEqual({ colorId: 3, sizeId: 12 });
    expect(parsePosVariantSku("pos-a-b-c-1-x")).toBeNull();
    expect(parsePosVariantSku("WEB-SKU-1")).toBeNull();
  });

  it("reconoce el SKU del POS como id de línea y deja pasar los ids de Neon", () => {
    expect(parsePosLineId("pos-SET-VENUS-3-12")).toEqual({ slug: "set-venus", colorId: 3, sizeId: 12 });
    expect(parsePosLineId("pos-blusa-lino-1-x")).toBeNull();
    expect(parsePosLineId("clx9k2m0p0001abcd1234efgh")).toBeNull();
  });

  it("envía solo los ítems del POS con slug en minúsculas", () => {
    const payload = buildPosOrderPayload(order, new Map([["p-pos", "SET-VENUS"]]));
    expect(payload).toEqual(expect.objectContaining({ orderNumber: "ORD-001" }));
    expect(payload?.lines).toEqual([
      expect.objectContaining({ productSlug: "set-venus", colorId: 3, sizeId: 12, quantity: 2, unitPrice: 60000 }),
    ]);
    expect(payload?.customer).toEqual(expect.objectContaining({ fullName: "Laura Gómez", email: "laura@correo.co" }));
  });

  it("no envía pedidos sin productos del POS", () => {
    expect(buildPosOrderPayload(order, new Map())).toBeNull();
  });

  it("prorratea descuento y envío en pedidos mixtos y envía el pago", () => {
    const payload = buildPosOrderPayload(
      {
        ...order,
        total: 176000,
        couponCode: "VERANO10",
        shippingDepartment: "Santander",
        payment: { method: "BOLD", paymentId: "PAY-9", transactionId: "TX-9", paidAt: "2026-10-01T14:00:00Z" },
        items: order.items.map((i) => ({ ...i, name: "SET VENUS", colorName: "Azul", size: "M" as const })),
      },
      new Map([["p-pos", "SET-VENUS"]]),
    );
    // Productos del POS: 120.000 de 170.000 → 12/17 del descuento (5.000) y del envío (11.000).
    expect(payload?.discount).toBe(3529);
    expect(payload?.shipping).toBe(7765);
    expect(payload?.orderTotal).toBe(176000);
    expect(payload?.couponCode).toBe("VERANO10");
    expect(payload?.customer?.department).toBe("Santander");
    expect(payload?.payment).toEqual({
      method: "BOLD",
      paymentId: "PAY-9",
      transactionId: "TX-9",
      paidAt: "2026-10-01T14:00:00.000Z",
    });
    expect(payload?.lines[0]).toEqual(
      expect.objectContaining({ name: "SET VENUS", colorName: "Azul", size: "M", sku: "pos-SET-VENUS-3-12" }),
    );
  });

  it("envía el bloque promotion con el promotionId del POS", () => {
    const payload = buildPosOrderPayload(
      {
        ...order,
        coupon: { code: "BF25", posPromotionId: "PRM-2026-0042", discountType: "PERCENTAGE", discountValue: 25 },
      },
      new Map([["p-pos", "SET-VENUS"]]),
    );
    // Pedido sin reparto por línea (viejo): el descuento se prorratea por subtotal.
    expect(payload?.promotion).toEqual({
      promotionId: "PRM-2026-0042",
      code: "BF25",
      source: "POS",
      discountType: "PERCENTAGE",
      discountValue: 25,
      orderDiscount: 5000,
      posDiscount: 3529,
    });
  });

  it("con el reparto por línea del POS, al POS va la suma de las líneas de sus productos", () => {
    const coupon = { code: "WEBONLY", posPromotionId: "PRM-2026-0050", discountType: "FIXED" as const, discountValue: 5000 };
    // Solo el producto de la web era elegible: al POS no le corresponde descuento.
    const webOnly = buildPosOrderPayload(
      {
        ...order,
        coupon,
        items: [
          { ...order.items[0], couponDiscount: 0 },
          { ...order.items[1], couponDiscount: 5000 },
        ],
      },
      new Map([["p-pos", "SET-VENUS"]]),
    );
    expect(webOnly?.discount).toBe(0);
    expect(webOnly?.promotion?.posDiscount).toBe(0);
    expect(webOnly?.shipping).toBe(7765);

    const posOnly = buildPosOrderPayload(
      {
        ...order,
        coupon,
        items: [
          { ...order.items[0], couponDiscount: 5000 },
          { ...order.items[1], couponDiscount: 0 },
        ],
      },
      new Map([["p-pos", "SET-VENUS"]]),
    );
    expect(posOnly?.discount).toBe(5000);
    expect(posOnly?.promotion?.posDiscount).toBe(5000);
  });

  it("cupón viejo de la web (sin promotionId): el POS solo guarda el código", () => {
    const web = buildPosOrderPayload(
      { ...order, coupon: { code: "VERANO10", posPromotionId: null, discountType: "PERCENTAGE", discountValue: 10 } },
      new Map([["p-pos", "SET-VENUS"]]),
    );
    expect(web?.promotion?.promotionId).toBeNull();
    expect(web?.promotion?.source).toBe("WEB");
  });

  it("si todo el pedido es del POS, el descuento y el envío van completos", () => {
    const payload = buildPosOrderPayload(
      { ...order, items: [order.items[0]] },
      new Map([["p-pos", "SET-VENUS"]]),
    );
    expect(payload?.discount).toBe(5000);
    expect(payload?.shipping).toBe(11000);
  });
});
