import { COLLECTION_PRODUCTS, MAX_PRICE } from "../constants";

describe("COLLECTION_PRODUCTS", () => {
  it("contiene 8 productos", () => {
    expect(COLLECTION_PRODUCTS).toHaveLength(8);
  });

  it("cada producto tiene name, price, slug e image", () => {
    COLLECTION_PRODUCTS.forEach((p) => {
      expect(p).toHaveProperty("name");
      expect(p).toHaveProperty("price");
      expect(p).toHaveProperty("slug");
      expect(p).toHaveProperty("image");
    });
  });

  it("los precios son números positivos", () => {
    COLLECTION_PRODUCTS.forEach((p) => {
      expect(p.price).toBeGreaterThan(0);
    });
  });

  it("los slugs son únicos", () => {
    const slugs = COLLECTION_PRODUCTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("los productos con oldPrice tienen badge 'Oferta'", () => {
    const withOldPrice = COLLECTION_PRODUCTS.filter((p) => p.oldPrice !== undefined);
    withOldPrice.forEach((p) => {
      expect(p.badge).toBe("Oferta");
    });
  });

  it("los oldPrice son mayores al price cuando existen", () => {
    COLLECTION_PRODUCTS.filter((p) => p.oldPrice).forEach((p) => {
      expect(p.oldPrice!).toBeGreaterThan(p.price);
    });
  });

  it("los productos con colors tienen un array no vacío", () => {
    COLLECTION_PRODUCTS.filter((p) => p.colors).forEach((p) => {
      expect(p.colors!.length).toBeGreaterThan(0);
    });
  });
});

describe("MAX_PRICE", () => {
  it("es un número positivo", () => {
    expect(MAX_PRICE).toBeGreaterThan(0);
  });

  it("es mayor o igual al precio más alto de los productos", () => {
    const highest = Math.max(...COLLECTION_PRODUCTS.map((p) => p.price));
    expect(MAX_PRICE).toBeGreaterThanOrEqual(highest);
  });
});
