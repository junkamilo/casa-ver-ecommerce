/** @jest-environment node */

// Smoke tests del subm\u00f3dulo catalog/product \u2014 cubren la l\u00f3gica pura
// (mappers UI, helpers de slug, social proof, video URL). NO ejecuta llamadas
// a Prisma, NextAuth ni revalidatePath.

import {
  computeReviewMetrics,
  computeTotalStock,
  extractUserReview,
  mapProductReviews,
  mapSocialProof,
  mapUIColor,
  mapUIItems,
  mapUIProduct,
  normalizeToSlug,
  normalizeTipoCandidates,
  resolveGalleryAndVideo,
  resolveInitialItemId,
} from "@/modules/catalog/product/domain/product-detail.entity";
import {
  isVideoUrl,
  normalizeVideoUrl,
} from "@/modules/catalog/product/domain/video-url.entity";
import { parseDescriptionBullets } from "@/app/product/[slug]/utils/description";

// ── parseDescriptionBullets ───────────────────────────────────────────────────

describe("parseDescriptionBullets", () => {
  it("divide por saltos de línea y quita guiones iniciales", () => {
    const result = parseDescriptionBullets(
      "- Cuello Mao\n- Manga corta\nDiseñado en licra"
    );
    expect(result).toEqual(["Cuello Mao", "Manga corta", "Diseñado en licra"]);
  });

  it("soporta texto legacy en una sola línea con ' - '", () => {
    const result = parseDescriptionBullets(
      "-Cuello Mao con abertura. - Manga corta tipo casquillo. - Diseñado en licra"
    );
    expect(result).toHaveLength(3);
    expect(result[0]).toMatch(/^Cuello Mao/);
  });

  it("devuelve un solo párrafo si no hay separadores", () => {
    expect(parseDescriptionBullets("Prenda cómoda de licra premium.")).toEqual([
      "Prenda cómoda de licra premium.",
    ]);
  });
});

// ── video-url helpers ────────────────────────────────────────────────────────

describe("video-url helpers", () => {
  it("isVideoUrl detecta extensiones de video y rutas /video/", () => {
    expect(isVideoUrl("https://x.com/video.mp4")).toBe(true);
    expect(isVideoUrl("https://x.com/clip.MOV")).toBe(true);
    expect(isVideoUrl("https://media.casaverdeoficial.com/casa-verde/products/sample.mp4")).toBe(true);
    expect(isVideoUrl("https://media.casaverdeoficial.com/casa-verde/products/clip")).toBe(false);
    expect(isVideoUrl("https://x.com/img.jpg")).toBe(false);
    expect(isVideoUrl("https://x.com/img.png")).toBe(false);
    expect(isVideoUrl("")).toBe(false);
  });

  it("normalizeVideoUrl preserva la URL original", () => {
    expect(normalizeVideoUrl("a.mov")).toBe("a.mov");
    expect(normalizeVideoUrl("a.mov?v=1")).toBe("a.mov?v=1");
    expect(normalizeVideoUrl("a.webm")).toBe("a.webm");
    expect(normalizeVideoUrl("a.avi")).toBe("a.avi");
    expect(normalizeVideoUrl("a.mkv")).toBe("a.mkv");
    expect(normalizeVideoUrl("a.mp4")).toBe("a.mp4");
    expect(normalizeVideoUrl("a.jpg")).toBe("a.jpg");
  });
});

// ── normalizeToSlug / normalizeTipoCandidates ─────────────────────────────────

describe("slug helpers", () => {
  it("normalizeToSlug remueve acentos y caracteres especiales", () => {
    expect(normalizeToSlug("Pantal\u00f3n Largo")).toBe("pantalon-largo");
    expect(normalizeToSlug("  Cami\u00e7a  ")).toBe("camica");
    expect(normalizeToSlug("Set de Verano!")).toBe("set-de-verano");
    expect(normalizeToSlug("--foo--bar--")).toBe("foo-bar");
  });

  it("normalizeTipoCandidates devuelve forma con y sin 's' final, sin duplicados", () => {
    expect(normalizeTipoCandidates("camisas")).toEqual(["camisas", "camisa"]);
    expect(normalizeTipoCandidates("camisa")).toEqual(["camisa"]);
    expect(normalizeTipoCandidates("")).toEqual([]);
  });
});

// ── mapUIColor ────────────────────────────────────────────────────────────────

describe("mapUIColor", () => {
  it("ordena tallas por prioridad (XS, S, M, L, XL, XXL) y filtra stock 0", () => {
    const color = mapUIColor({
      id: "c1",
      name: "Negro",
      hexCode: "#000",
      images: [{ url: "/a.jpg" }, { url: "/v.mp4" }],
      variants: [
        { id: "v1", sku: "L1", size: "L", stock: 5 },
        { id: "v2", sku: "S1", size: "S", stock: 3 },
        { id: "v3", sku: "M1", size: "M", stock: 0 },
        { id: "v4", sku: "X1", size: "XS", stock: 1 },
      ],
    });

    expect(color.availableSizes).toEqual(["XS", "S", "L"]);
    expect(color.variants.map((v) => v.variantId)).toEqual(["v4", "v2", "v1"]);
    expect(color.images).toEqual(["/a.jpg", "/v.mp4"]);
    expect(color.isOutOfStock).toBe(false);
  });

  it("isOutOfStock=true cuando todas las variants tienen stock 0", () => {
    const color = mapUIColor({
      id: "c2",
      name: "Rojo",
      hexCode: "#f00",
      images: [],
      variants: [
        { id: "v1", sku: "S1", size: "S", stock: 0 },
        { id: "v2", sku: "M1", size: "M", stock: 0 },
      ],
    });
    expect(color.isOutOfStock).toBe(true);
    expect(color.availableSizes).toEqual([]);
  });

  it("ordena tallas no est\u00e1ndar alfab\u00e9ticamente despu\u00e9s de las est\u00e1ndar", () => {
    const color = mapUIColor({
      id: "c3",
      name: "Verde",
      hexCode: "#0f0",
      images: [],
      variants: [
        { id: "v1", sku: "u1", size: "UNICA", stock: 1 },
        { id: "v2", sku: "m1", size: "M", stock: 1 },
      ],
    });
    expect(color.availableSizes).toEqual(["M", "UNICA"]);
  });
});

// ── computeTotalStock ─────────────────────────────────────────────────────────

describe("computeTotalStock", () => {
  it("para set: suma stock de items[].colors[].variants", () => {
    const total = computeTotalStock(
      { isSet: true, colors: [] },
      [
        { id: "i1", name: "A", description: null, price: 1, comparePrice: null, videoUrl: null, stock: 10, colors: [] },
        { id: "i2", name: "B", description: null, price: 2, comparePrice: null, videoUrl: null, stock: 5, colors: [] },
      ],
    );
    expect(total).toBe(15);
  });

  it("para no-set: suma stock de product.colors[].variants", () => {
    const total = computeTotalStock(
      {
        isSet: false,
        colors: [
          {
            id: "c1",
            name: "X",
            hexCode: "#x",
            images: [],
            variants: [
              { id: "v1", sku: "a", size: "S", stock: 4 },
              { id: "v2", sku: "b", size: "M", stock: 6 },
            ],
          },
        ],
      },
      [],
    );
    expect(total).toBe(10);
  });

  it("para set sin items: cae al stock del padre", () => {
    const total = computeTotalStock(
      {
        isSet: true,
        colors: [
          {
            id: "c1",
            name: "X",
            hexCode: "#x",
            images: [],
            variants: [{ id: "v1", sku: "a", size: "S", stock: 7 }],
          },
        ],
      },
      [],
    );
    expect(total).toBe(7);
  });
});

// ── mapUIProduct (badge integration) ──────────────────────────────────────────

describe("mapUIProduct badge integration", () => {
  const baseProduct = {
    id: "p1",
    name: "Test",
    slug: "test",
    description: "desc",
    basePrice: 100,
    comparePrice: null,
    videoUrl: null,
    isSet: false,
    isProductNew: false,
    isProductNewAt: null,
    isOnSale: false,
    images: [],
    colors: [],
    items: [],
    reviews: [],
  };

  it("badge 'Agotado' cuando totalStock=0", () => {
    const result = mapUIProduct(baseProduct, [], 0, 0, 0, null, []);
    expect(result.badge).toBe("Agotado");
  });

  it("badge 'En Oferta' cuando hay stock + isOnSale", () => {
    const result = mapUIProduct(
      { ...baseProduct, isOnSale: true },
      [],
      10,
      0,
      0,
      null,
      [],
    );
    expect(result.badge).toBe("En Oferta");
  });

  it("filtra videos del array generalImages", () => {
    const result = mapUIProduct(
      baseProduct,
      [],
      5,
      0,
      0,
      null,
      ["/img.jpg", "/clip.mp4", "/photo.png"],
    );
    expect(result.generalImages).toEqual(["/img.jpg", "/photo.png"]);
  });
});

// ── mapUIItems ────────────────────────────────────────────────────────────────

describe("mapUIItems", () => {
  it("calcula stock total sumando todas las variants de todos los colores", () => {
    const items = mapUIItems([
      {
        id: "i1",
        name: "Camisa",
        description: null,
        price: 50,
        comparePrice: 70,
        videoUrl: null,
        colors: [
          {
            id: "c1",
            name: "X",
            hexCode: "#x",
            images: [],
            variants: [
              { id: "v1", sku: "a", size: "S", stock: 2 },
              { id: "v2", sku: "b", size: "M", stock: 3 },
            ],
          },
          {
            id: "c2",
            name: "Y",
            hexCode: "#y",
            images: [],
            variants: [{ id: "v3", sku: "c", size: "L", stock: 5 }],
          },
        ],
      },
    ]);
    expect(items[0].stock).toBe(10);
    expect(items[0].price).toBe(50);
    expect(items[0].comparePrice).toBe(70);
  });

  it("price y comparePrice null cuando vienen como null/undefined", () => {
    const items = mapUIItems([
      {
        id: "i1",
        name: "X",
        description: null,
        price: null,
        comparePrice: null,
        videoUrl: null,
        colors: [],
      },
    ]);
    expect(items[0].price).toBeNull();
    expect(items[0].comparePrice).toBeNull();
    expect(items[0].stock).toBe(0);
  });
});

// ── mapProductReviews / mapSocialProof / extractUserReview ────────────────────

describe("reviews / social proof helpers", () => {
  it("mapProductReviews cae a 'Clienta' si no hay nombre", () => {
    const reviews = mapProductReviews([
      { rating: 5, comment: "Excelente", createdAt: new Date("2024-06-15"), user: { name: null } },
      { rating: 3, comment: null, createdAt: "2024-01-01", user: null },
    ]);
    expect(reviews[0].name).toBe("Clienta");
    expect(reviews[1].name).toBe("Clienta");
    expect(reviews[1].comment).toBe("");
  });

  it("computeReviewMetrics devuelve promedio + count, o 0/0 si vac\u00edo", () => {
    const m1 = computeReviewMetrics([
      { rating: 5, comment: null, createdAt: new Date(), user: null },
      { rating: 3, comment: null, createdAt: new Date(), user: null },
    ]);
    expect(m1.liveRating).toBe(4);
    expect(m1.liveNumReviews).toBe(2);

    const m2 = computeReviewMetrics([]);
    expect(m2.liveRating).toBe(0);
    expect(m2.liveNumReviews).toBe(0);
  });

  it("mapSocialProof devuelve totalBuyers y los primeros 3 nombres", () => {
    const proof = mapSocialProof([
      { shippingName: "Maria Lopez", user: { image: "/m.jpg" } },
      { shippingName: "Juan Perez Garcia", user: { image: null } },
      // shippingName null preserva comportamiento legacy: devuelve "" (string vacío)
      { shippingName: null, user: { image: null } },
      { shippingName: "Otro", user: { image: null } },
    ]);
    expect(proof.totalBuyers).toBe(4);
    expect(proof.recentBuyers).toEqual([
      { name: "Maria", avatar: "/m.jpg" },
      { name: "Juan", avatar: null },
      { name: "", avatar: null },
    ]);
  });

  it("extractUserReview devuelve null cuando userId es null", () => {
    expect(
      extractUserReview(
        [{ rating: 4, comment: "x", createdAt: new Date(), user: null, userId: "u1" }],
        null,
      ),
    ).toBeNull();
  });

  it("extractUserReview encuentra la rese\u00f1a del userId", () => {
    expect(
      extractUserReview(
        [
          { rating: 4, comment: "del otro", createdAt: new Date(), user: null, userId: "u2" },
          { rating: 5, comment: "del usuario", createdAt: new Date(), user: null, userId: "u1" },
        ],
        "u1",
      ),
    ).toEqual({ rating: 5, comment: "del usuario" });
  });
});

// ── resolveGalleryAndVideo ────────────────────────────────────────────────────

describe("resolveGalleryAndVideo", () => {
  it("filtra im\u00e1genes con colorId (solo generales) y resuelve videoUrl preferido del DB", () => {
    const result = resolveGalleryAndVideo({
      videoUrl: "/db.mp4",
      images: [
        { url: "/general1.jpg", colorId: null },
        { url: "/del-color.jpg", colorId: "c1" },
        { url: "/general2.jpg", colorId: null },
      ],
    });
    expect(result.allGeneralImages).toEqual(["/general1.jpg", "/general2.jpg"]);
    expect(result.resolvedVideoUrl).toBe("/db.mp4");
  });

  it("cae al primer .mp4 del array de generales si videoUrl es null", () => {
    const result = resolveGalleryAndVideo({
      videoUrl: null,
      images: [
        { url: "/general1.jpg", colorId: null },
        { url: "/clip.mp4", colorId: null },
      ],
    });
    expect(result.resolvedVideoUrl).toBe("/clip.mp4");
  });

  it("resolvedVideoUrl null si no hay nada", () => {
    const result = resolveGalleryAndVideo({
      videoUrl: null,
      images: [{ url: "/general.jpg", colorId: null }],
    });
    expect(result.resolvedVideoUrl).toBeNull();
  });
});

// ── resolveInitialItemId ──────────────────────────────────────────────────────

describe("resolveInitialItemId", () => {
  const items = [
    { id: "i1", name: "Camisa", description: null, price: 1, comparePrice: null, videoUrl: null, stock: 0, colors: [] },
    { id: "i2", name: "Pantal\u00f3n Largo", description: null, price: 1, comparePrice: null, videoUrl: null, stock: 0, colors: [] },
  ];

  it("devuelve null si no es set o falta tipo", () => {
    expect(resolveInitialItemId(false, items, "camisa")).toBeNull();
    expect(resolveInitialItemId(true, items, undefined)).toBeNull();
  });

  it("matchea por slug normalizado exacto", () => {
    expect(resolveInitialItemId(true, items, "Camisa")).toBe("i1");
  });

  it("matchea por singular (quita 's' final del slug normalizado)", () => {
    // "camisas" \u2192 candidates: ["camisas", "camisa"] \u2192 matchea "camisa"
    expect(resolveInitialItemId(true, items, "camisas")).toBe("i1");
  });

  it("matchea por inclusi\u00f3n parcial (candidate contiene normalized o viceversa)", () => {
    // "pantalon" \u2192 "pantalon-largo".includes("pantalon")? S\u00ed.
    expect(resolveInitialItemId(true, items, "pantalon")).toBe("i2");
  });

  it("devuelve null si no hay coincidencia", () => {
    expect(resolveInitialItemId(true, items, "blusa")).toBeNull();
  });
});
