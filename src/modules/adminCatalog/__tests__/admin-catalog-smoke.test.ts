/** @jest-environment node */

import { prisma } from "@/lib/prisma";
import { listCategoriesUseCase } from "@/modules/adminCatalog/categories/application/list-categories.use-case";
import { createCategoryUseCase } from "@/modules/adminCatalog/categories/application/create-category.use-case";
import { updateCategoryUseCase } from "@/modules/adminCatalog/categories/application/update-category.use-case";
import { deleteCategoryUseCase } from "@/modules/adminCatalog/categories/application/delete-category.use-case";
import { listColorsUseCase } from "@/modules/adminCatalog/colors/application/list-colors.use-case";
import { createColorUseCase } from "@/modules/adminCatalog/colors/application/create-color.use-case";
import { updateColorUseCase } from "@/modules/adminCatalog/colors/application/update-color.use-case";
import { deleteColorUseCase } from "@/modules/adminCatalog/colors/application/delete-color.use-case";
import { listGarmentTypesUseCase } from "@/modules/adminCatalog/garmentTypes/application/list-garment-types.use-case";
import { createGarmentTypeUseCase } from "@/modules/adminCatalog/garmentTypes/application/create-garment-type.use-case";
import { updateGarmentTypeUseCase } from "@/modules/adminCatalog/garmentTypes/application/update-garment-type.use-case";
import { deleteGarmentTypeUseCase } from "@/modules/adminCatalog/garmentTypes/application/delete-garment-type.use-case";
import { listProductsUseCase } from "@/modules/adminCatalog/products/application/list-products.use-case";
import { createProductUseCase } from "@/modules/adminCatalog/products/application/create-product.use-case";
import { updateProductUseCase } from "@/modules/adminCatalog/products/application/update-product.use-case";
import { deleteProductUseCase } from "@/modules/adminCatalog/products/application/delete-product.use-case";
import { getProductByIdUseCase } from "@/modules/adminCatalog/products/application/get-product-by-id.use-case";
import { updateProductVariantStockUseCase } from "@/modules/adminCatalog/products/application/update-product-variant-stock.use-case";
import { GarmentTypeConflictError } from "@/modules/adminCatalog/garmentTypes/application/garment-type.errors";

const suffix = `smk${Date.now()}`;
const SMOKE_TIMEOUT_MS = 60_000;

let categoryId = "";
let colorId = "";
let garmentTypeId = "";
let garmentTypeBlockedId = "";
let simpleProductId = "";
let setProductId = "";

describe("Admin Catalog Smoke Tests", () => {
  jest.setTimeout(SMOKE_TIMEOUT_MS);

  afterAll(async () => {
    if (simpleProductId) await deleteProductUseCase({ id: simpleProductId });
    if (setProductId) await deleteProductUseCase({ id: setProductId });
    if (categoryId) await deleteCategoryUseCase({ id: categoryId });
    if (colorId) await deleteColorUseCase({ id: colorId });
    if (garmentTypeId) await deleteGarmentTypeUseCase({ id: garmentTypeId });
    if (garmentTypeBlockedId) await deleteGarmentTypeUseCase({ id: garmentTypeBlockedId });
    await prisma.$disconnect();
  });

  it("categories: list/create/edit/toggle/delete", async () => {
    const before = await listCategoriesUseCase();
    expect(Array.isArray(before)).toBe(true);

    const gt = await createGarmentTypeUseCase({ name: `GT Cat ${suffix}` });
    garmentTypeId = gt.id;

    const created = await createCategoryUseCase({
      name: `Category ${suffix}`,
      image: "",
      garmentTypeIds: [garmentTypeId],
    });
    categoryId = created.id;
    expect(created.name).toContain(suffix);

    const edited = await updateCategoryUseCase({
      id: categoryId,
      name: `Category Edit ${suffix}`,
      image: "",
      garmentTypeIds: [garmentTypeId],
    });
    expect(edited.name).toContain("Edit");

    const toggled = await updateCategoryUseCase({ id: categoryId, action: "toggle" });
    expect(typeof toggled.isActive).toBe("boolean");
    if (!toggled.isActive) {
      const restored = await updateCategoryUseCase({ id: categoryId, action: "toggle" });
      expect(restored.isActive).toBe(true);
    }
  });

  it("colors: list(active)/create/edit/toggle/delete", async () => {
    const active = await listColorsUseCase({ onlyActive: true });
    expect(Array.isArray(active)).toBe(true);

    const created = await createColorUseCase({
      name: `Color ${suffix}`,
      hexCode: "#123ABC",
    });
    colorId = created.id;

    const edited = await updateColorUseCase({
      id: colorId,
      name: `Color Edit ${suffix}`,
      hexCode: "#ABC123",
    });
    expect(edited.name).toContain("Edit");

    const toggled = await updateColorUseCase({ id: colorId, action: "toggle" });
    expect(typeof toggled.isActive).toBe("boolean");
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
      categoryId,
      status: "ACTIVE",
      isSet: false,
      colors: [{ name: "Negro", hexCode: "#111111", images: [], variantStocks: { M: 5, L: 5 } }],
      sizes: ["M", "L"],
      garmentTypes: [garmentTypeId],
    });
    simpleProductId = simple.id;

    const setProduct = await createProductUseCase({
      name: `Set ${suffix}`,
      description: "",
      basePrice: 0,
      comparePrice: null,
      stock: 0,
      categoryId,
      status: "ACTIVE",
      isSet: true,
      colors: [],
      sizes: [],
      garmentTypes: [garmentTypeId],
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
        categoryId,
        status: "ACTIVE",
        isSet: false,
        colors: [{ name: "Negro", hexCode: "#111111", images: [], variantStocks: { M: 4, L: 4 } }],
        sizes: ["M", "L"],
        garmentTypes: [garmentTypeId],
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

  it("garment-types: list/create/edit/toggle/delete with product blocking", async () => {
    const list = await listGarmentTypesUseCase();
    expect(Array.isArray(list)).toBe(true);

    garmentTypeBlockedId = (
      await createGarmentTypeUseCase({ name: `GT Block ${suffix}` })
    ).id;

    await updateCategoryUseCase({
      id: categoryId,
      name: `Category Block ${suffix}`,
      image: "",
      garmentTypeIds: [garmentTypeId, garmentTypeBlockedId],
    });

    await updateProductUseCase({
      id: simpleProductId,
      body: {
        name: `Simple GT ${suffix}`,
        description: "Producto simple con tipo bloqueado para test",
        basePrice: 110000,
        comparePrice: 140000,
        stock: 8,
        categoryId,
        status: "ACTIVE",
        isSet: false,
        colors: [{ name: "Negro", hexCode: "#111111", images: [], variantStocks: { M: 4, L: 4 } }],
        sizes: ["M", "L"],
        garmentTypes: [garmentTypeBlockedId],
      },
    });

    const edited = await updateGarmentTypeUseCase({
      id: garmentTypeBlockedId,
      name: `GT Block Edit ${suffix}`,
    });
    expect(edited.name).toContain("Edit");

    const toggled = await updateGarmentTypeUseCase({ id: garmentTypeBlockedId, action: "toggle" });
    expect(typeof toggled.isActive).toBe("boolean");

    await expect(deleteGarmentTypeUseCase({ id: garmentTypeBlockedId })).rejects.toBeInstanceOf(
      GarmentTypeConflictError
    );
  });
});
