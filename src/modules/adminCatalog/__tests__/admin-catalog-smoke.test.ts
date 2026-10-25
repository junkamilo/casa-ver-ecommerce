/** @jest-environment node */

import { prisma } from "@/lib/prisma";
import { listProductsUseCase } from "@/modules/adminCatalog/products/application/list-products.use-case";
import { createProductUseCase } from "@/modules/adminCatalog/products/application/create-product.use-case";
import { updateProductUseCase } from "@/modules/adminCatalog/products/application/update-product.use-case";
import { deleteProductUseCase } from "@/modules/adminCatalog/products/application/delete-product.use-case";
import { getProductByIdUseCase } from "@/modules/adminCatalog/products/application/get-product-by-id.use-case";
import { updateProductVariantStockUseCase } from "@/modules/adminCatalog/products/application/update-product-variant-stock.use-case";

const suffix = `smk${Date.now()}`;
const SMOKE_TIMEOUT_MS = 60_000;

let simpleProductId = "";
let setProductId = "";

// Categorías, tipos de prenda y colores ya no se administran en la web (los publica el POS).
describe("Admin Catalog Smoke Tests", () => {
  jest.setTimeout(SMOKE_TIMEOUT_MS);

  afterAll(async () => {
    if (simpleProductId) await deleteProductUseCase({ id: simpleProductId });
    if (setProductId) await deleteProductUseCase({ id: setProductId });
    await prisma.$disconnect();
  });

  it("products: list/create simple/create set/edit/toggle/delete/update variant stock", async () => {
    const list = await listProductsUseCase({ page: 1, limit: 25 });
    expect(Array.isArray(list.data)).toBe(true);
    expect(list.pagination.page).toBe(1);

    const simple = await createProductUseCase({
      name: `Simple ${suffix}`,
      description: "Producto simple de smoke test con descripcion valida",
      basePrice: 120000,
      comparePrice: 150000,
      stock: 10,
      status: "ACTIVE",
      isSet: false,
      colors: [{ name: "Negro", hexCode: "#111111", images: [], variantStocks: { M: 5, L: 5 } }],
      sizes: ["M", "L"],
    });
    simpleProductId = simple.id;

    const setProduct = await createProductUseCase({
      name: `Set ${suffix}`,
      description: "",
      basePrice: 0,
      comparePrice: null,
      stock: 0,
      status: "ACTIVE",
      isSet: true,
      colors: [],
      sizes: [],
      items: [
        {
          name: "Item Uno",
          description: "Subitem valido para smoke test",
          price: 99000,
          comparePrice: 120000,
          colors: [{ name: "Azul", hexCode: "#0000FF", images: [], variantStocks: { M: 3 } }],
          sizes: ["M"],
          stock: 3,
        },
      ],
    });
    setProductId = setProduct.id;

    const updated = await updateProductUseCase({
      id: simpleProductId,
      body: {
        name: `Simple Edit ${suffix}`,
        description: "Descripcion editada para smoke test",
        basePrice: 110000,
        comparePrice: 140000,
        stock: 8,
        status: "ACTIVE",
        isSet: false,
        colors: [{ name: "Negro", hexCode: "#111111", images: [], variantStocks: { M: 4, L: 4 } }],
        sizes: ["M", "L"],
      },
    });
    expect((updated as { name: string }).name).toContain("Edit");

    const toggled = await updateProductUseCase({ id: simpleProductId, body: { active: false } });
    expect((toggled as { status: string }).status).toBe("INACTIVE");

    const detailed = await getProductByIdUseCase(simpleProductId);
    const firstVariant = detailed.variants[0];
    expect(firstVariant).toBeDefined();

    const variantUpdated = await updateProductVariantStockUseCase({
      productId: simpleProductId,
      variantId: firstVariant.id,
      body: { stock: 7 },
    });
    expect(variantUpdated.stock).toBe(7);
  });
});
