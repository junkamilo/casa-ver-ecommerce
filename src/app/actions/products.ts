"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { deleteMediaAssetsByUrls } from "@/lib/media-admin";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

const ALLOWED_STATUSES = ["ACTIVE", "INACTIVE"] as const;
const ALLOWED_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "ONESIZE"] as const;
type AllowedSize = (typeof ALLOWED_SIZES)[number];

type ColorInput = { name: string; hexCode: string; images?: string[]; variantStocks?: { [size: string]: number } };
type SetItemInput = {
  name: string;
  description?: string | null;
  price?: number | null;
  comparePrice?: number | null;
  videoUrl?: string | null;
  stock?: number;
  colors: ColorInput[];
  sizes: string[];
};

export type ProductPayload = {
  name: string;
  description?: string;
  basePrice: number;
  comparePrice?: number | null;
  stock?: number;
  categoryIds: string[];
  /** @deprecated usar categoryIds */
  categoryId?: string;
  status?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isProductNew?: boolean;
  isProductNewAt?: string | null;
  isOnSale?: boolean;
  isOnSaleAt?: string | null;
  videoUrl?: string | null;
  /** IDs de tipos de prenda (muchos-a-muchos) — lo que envía el formulario admin */
  garmentTypes?: string[];
  /** @deprecated usar garmentTypes */
  garmentType?: string | null;
  isSet?: boolean;
  colors?: ColorInput[];
  sizes?: string[];
  items?: SetItemInput[];
};

// ── Constantes de validación ──────────────────────────────────────────────────

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

// ── Shared validation ────────────────────────────────────────────────────────

function parseCategoryIds(payload: ProductPayload): string[] {
  const raw =
    Array.isArray(payload.categoryIds) && payload.categoryIds.length > 0
      ? payload.categoryIds
      : payload.categoryId
        ? [payload.categoryId]
        : [];
  const normalized = raw
    .filter((id): id is string => typeof id === "string")
    .map((id) => id.trim())
    .filter(Boolean);
  return [...new Set(normalized)];
}

function validatePayload(payload: ProductPayload, isCreate: boolean): string | null {
  const { name, basePrice, isSet, status, sizes, colors } = payload;
  const resolvedCategoryIds = parseCategoryIds(payload);

  if (!name || typeof name !== "string" || name.trim().length < 3) {
    return "El nombre debe tener al menos 3 caracteres";
  }
  if (name.trim().length > 200) {
    return "El nombre no puede superar 200 caracteres";
  }
  if (resolvedCategoryIds.length === 0) {
    return "Selecciona al menos una categoría";
  }
  if (resolvedCategoryIds.length > 10) {
    return "Demasiadas categorías (máximo 10)";
  }
  if (!isSet) {
    const price = Number(basePrice);
    if (isNaN(price) || price <= 0) {
      return "El precio debe ser mayor a 0";
    }
    if (isCreate && price > 100_000_000) {
      return "El precio parece inusualmente alto";
    }
  }
  if (status && !ALLOWED_STATUSES.includes(status as never)) {
    return `Estado inválido: ${status}`;
  }
  if (sizes) {
    const invalidSizes = sizes.filter((s) => !ALLOWED_SIZES.includes(s as AllowedSize));
    if (invalidSizes.length > 0) return `Tallas inválidas: ${invalidSizes.join(", ")}`;
  }
  // Para isSet=true los colores/tallas viven en las subcategorías, no en el padre
  if (!isSet) {
    if (!colors || colors.length === 0)
      return "Debes seleccionar al menos 1 color para el producto";
    if (!sizes || sizes.length === 0)
      return "Debes seleccionar al menos 1 talla para el producto";
  }

  for (const c of (colors || [])) {
    if (!c.name || typeof c.name !== "string") return "Nombre de color inválido";
    if (!HEX_RE.test(c.hexCode || "")) {
      return `Código de color inválido: ${c.hexCode}`;
    }
  }

  return null;
}

function parseGarmentTypeIds(payload: ProductPayload): string[] {
  const raw =
    Array.isArray(payload.garmentTypes) && payload.garmentTypes.length > 0
      ? payload.garmentTypes
      : payload.garmentType
        ? [payload.garmentType]
        : [];
  const normalized = raw
    .filter((id): id is string => typeof id === "string")
    .map((id) => id.trim())
    .filter(Boolean);
  return [...new Set(normalized)];
}

async function assertGarmentTypesValidForCategories(
  categoryIds: string[],
  ids: string[],
): Promise<string | null> {
  if (ids.length === 0) return null;
  if (ids.length > 20) return "Demasiados tipos de prenda (máximo 20)";
  const valid = await prisma.garmentType.findMany({
    where: {
      id: { in: ids },
      isActive: true,
      categories: { some: { categoryId: { in: categoryIds } } },
    },
    select: { id: true },
  });
  if (valid.length !== ids.length) {
    return "Uno o más tipos de prenda no existen, están inactivos o no pertenecen a la categoría seleccionada";
  }
  return null;
}

function collectPayloadAssetUrls(payload: ProductPayload): string[] {
  const urls: string[] = [];

  if (payload.videoUrl) urls.push(payload.videoUrl);
  for (const color of payload.colors ?? []) {
    for (const url of color.images ?? []) urls.push(url);
  }
  for (const item of payload.items ?? []) {
    if (item.videoUrl) urls.push(item.videoUrl);
    for (const color of item.colors ?? []) {
      for (const url of color.images ?? []) urls.push(url);
    }
  }

  return [...new Set(urls.map((u) => u.trim()).filter(Boolean))];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collectProductAssetUrls(product: any): string[] {
  if (!product) return [];

  const urls: string[] = [];
  if (product.videoUrl) urls.push(product.videoUrl);

  for (const image of product.images ?? []) {
    if (image.url) urls.push(image.url);
  }
  for (const color of product.colors ?? []) {
    for (const image of color.images ?? []) {
      if (image.url) urls.push(image.url);
    }
  }
  for (const item of product.items ?? []) {
    if (item.videoUrl) urls.push(item.videoUrl);
    for (const color of item.colors ?? []) {
      for (const image of color.images ?? []) {
        if (image.url) urls.push(image.url);
      }
    }
  }

  return [...new Set(urls.map((u) => u.trim()).filter(Boolean))];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createColorVariants(tx: any, productId: string, slug: string, colors: ColorInput[], sizes: string[], globalStock: number) {
  const totalVariants = colors.length * sizes.length;
  const base = totalVariants > 0 ? Math.floor(globalStock / totalVariants) : 0;
  const rem = totalVariants > 0 ? globalStock % totalVariants : 0;
  let idx = 0;

  for (const colorData of colors) {
    if (!colorData.name) continue;
    const color = await tx.productColor.create({
      data: { productId, name: colorData.name, hexCode: colorData.hexCode || "#000000" },
    });
    if (colorData.images?.length) {
      await tx.productImage.createMany({
        data: colorData.images.map((url: string, i: number) => ({
          productId, colorId: color.id, url, altText: colorData.name, order: i,
        })),
      });
    }
    for (const size of sizes) {
      const sku = `${slug}-${colorData.name.toLowerCase().replace(/\s+/g, "-")}-${size.toLowerCase()}`;
      const variantStock = colorData.variantStocks?.[size] !== undefined
        ? Number(colorData.variantStocks[size])
        : base + (idx < rem ? 1 : 0);
      await tx.productVariant.create({
        data: { productId, colorId: color.id, size: size as never, sku, stock: variantStock, minStock: 2 },
      });
      idx++;
    }
  }
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createSetItems(tx: any, productId: string, slug: string, items: SetItemInput[]) {
  for (let order = 0; order < items.length; order++) {
    const itemData = items[order];
    if (!itemData.name) continue;

    const productItem = await tx.productItem.create({
      data: {
        productId,
        name: itemData.name,
        description: itemData.description || null,
        price: itemData.price || null,
        comparePrice: itemData.comparePrice || null,
        videoUrl: itemData.videoUrl || null,
        order,
      },
    });

    const itemStock = itemData.stock ?? 0;
    const hasVariantStocks = (itemData.colors || []).some(
      (c) => c.variantStocks && Object.keys(c.variantStocks).length > 0
    );
    const totalVariants = (itemData.colors?.length ?? 0) * (itemData.sizes?.length ?? 0);
    const base = !hasVariantStocks && totalVariants > 0 ? Math.floor(itemStock / totalVariants) : 0;
    const rem = !hasVariantStocks && totalVariants > 0 ? itemStock % totalVariants : 0;
    let idx = 0;

    for (const colorData of itemData.colors || []) {
      if (!colorData.name) continue;
      const itemColor = await tx.productItemColor.create({
        data: { itemId: productItem.id, name: colorData.name, hexCode: colorData.hexCode || "#000000" },
      });
      if (colorData.images?.length) {
        await tx.productItemImage.createMany({
          data: colorData.images.map((url: string, i: number) => ({
            colorId: itemColor.id, url, altText: colorData.name, order: i,
          })),
        });
      }
      for (const size of itemData.sizes || []) {
        const sku = `${slug}-${itemData.name.toLowerCase().replace(/\s+/g, "-")}-${colorData.name.toLowerCase().replace(/\s+/g, "-")}-${size.toLowerCase()}`;
        const variantStock = colorData.variantStocks?.[size] !== undefined
          ? Number(colorData.variantStocks[size])
          : base + (idx < rem ? 1 : 0);
        await tx.productItemVariant.create({
          data: { colorId: itemColor.id, size: size as never, sku, stock: variantStock },
        });
        idx++;
      }
    }
  }
}

export async function updateVariantStocks(
  productId: string,
  updates: { variantId: string; newStock: number }[]
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "No autorizado" };
  }
  try {
    await prisma.$transaction(
      updates.map(({ variantId, newStock }) =>
        prisma.productVariant.update({
          where: { id: variantId },
          data: { stock: Number(newStock) },
        })
      )
    );
    revalidatePath("/admin/productos");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("[updateVariantStocks]", error);
    return { success: false, error: "Error al actualizar el stock" };
  }
}

export async function createProduct(payload: ProductPayload): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "No autorizado" };
  }

  const validationError = validatePayload(payload, true);
  if (validationError) return { success: false, error: validationError };

  const resolvedCategoryIds = parseCategoryIds(payload);
  const resolvedGarmentTypeIds = parseGarmentTypeIds(payload);
  const garmentTypesError = await assertGarmentTypesValidForCategories(
    resolvedCategoryIds,
    resolvedGarmentTypeIds,
  );
  if (garmentTypesError) return { success: false, error: garmentTypesError };

  try {
    const {
      name, description, status, isFeatured, isNew,
      isProductNew, isProductNewAt, isOnSale, isOnSaleAt,
      videoUrl, isSet, colors, sizes, items,
    } = payload;

    const basePrice    = parseFloat(String(payload.basePrice));
    const comparePrice = payload.comparePrice != null ? parseFloat(String(payload.comparePrice)) : null;
    const stock        = parseInt(String(payload.stock ?? 0), 10);

    const slug =
      name.toLowerCase().trim().replace(/[\s\W-]+/g, "-").replace(/^-+|-+$/g, "") +
      "-" + Date.now();

    const resolvedProductNewAt = isProductNew
      ? (isProductNewAt ? new Date(isProductNewAt) : new Date())
      : null;
    const resolvedOnSaleAt = isOnSale
      ? (isOnSaleAt ? new Date(isOnSaleAt) : new Date())
      : null;

    await db.$transaction(async (tx: any) => {
      const product = await tx.product.create({
        data: {
          name,
          slug,
          description: description || "",
          basePrice,
          comparePrice,
          status: status || "ACTIVE",
          isFeatured: isFeatured || false,
          isNew: isNew || false,
          isProductNew: isProductNew || false,
          isProductNewAt: resolvedProductNewAt,
          isOnSale: isOnSale || false,
          isOnSaleAt: resolvedOnSaleAt,
          videoUrl: videoUrl || null,
          categories: {
            create: resolvedCategoryIds.map((categoryId) => ({ categoryId })),
          },
          garmentTypes: resolvedGarmentTypeIds.length
            ? {
                create: resolvedGarmentTypeIds.map((garmentTypeId) => ({ garmentTypeId })),
              }
            : undefined,
          isSet: isSet || false,
          metaTitle: name.trim().slice(0, 60),
          metaDescription: (description || "").replace(/\s+/g, " ").trim().slice(0, 160),
        },
      });

      await createColorVariants(tx, product.id, slug, colors || [], sizes || [], stock);
      if (isSet) {
        await createSetItems(tx, product.id, slug, items || []);
      }
      return product;
    }, { timeout: 30000 });

    revalidatePath("/admin/productos");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("[createProduct]", error);
    return { success: false, error: "Error al crear el producto" };
  }
}

export async function updateProduct(id: string, payload: ProductPayload): Promise<{ success: boolean; error?: string; slug?: string }> {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "No autorizado" };
  }

  const validationError = validatePayload(payload, false);
  if (validationError) return { success: false, error: validationError };

  const resolvedCategoryIds = parseCategoryIds(payload);
  const resolvedGarmentTypeIds = parseGarmentTypeIds(payload);
  const garmentTypesError = await assertGarmentTypesValidForCategories(
    resolvedCategoryIds,
    resolvedGarmentTypeIds,
  );
  if (garmentTypesError) return { success: false, error: garmentTypesError };

  try {
    const {
      name, description, status, isFeatured, isNew,
      isProductNew, isProductNewAt, isOnSale, isOnSaleAt,
      videoUrl, isSet, colors, sizes, items,
    } = payload;

    const basePrice    = payload.basePrice  != null ? parseFloat(String(payload.basePrice))  : undefined;
    const comparePrice = payload.comparePrice != null ? parseFloat(String(payload.comparePrice)) : null;
    const stock        = parseInt(String(payload.stock ?? 0), 10);

    const resolvedProductNewAt = isProductNew
      ? (isProductNewAt ? new Date(isProductNewAt) : new Date())
      : null;
    const resolvedOnSaleAt = isOnSale
      ? (isOnSaleAt ? new Date(isOnSaleAt) : new Date())
      : null;

    const nextAssetUrls = collectPayloadAssetUrls(payload);
    let previousAssetUrls: string[] = [];

    const result = await db.$transaction(async (tx: any) => {
      const existingProduct = await tx.product.findUnique({
        where: { id },
        select: {
          videoUrl: true,
          images: { select: { url: true } },
          colors: { select: { images: { select: { url: true } } } },
          items: {
            select: {
              videoUrl: true,
              colors: { select: { images: { select: { url: true } } } },
            },
          },
        },
      });
      previousAssetUrls = collectProductAssetUrls(existingProduct);

      // Limpiar variantes, imágenes, items y sub-productos existentes antes de recrear
      await Promise.all([
        tx.productVariant.deleteMany({ where: { productId: id } }),
        tx.productImage.deleteMany({ where: { productId: id } }),
        tx.productItem.deleteMany({ where: { productId: id } }),
      ]);
      await tx.productColor.deleteMany({ where: { productId: id } });

      const product = await tx.product.update({
        where: { id },
        data: {
          name,
          description,
          basePrice,
          comparePrice,
          status,
          isFeatured,
          isNew,
          isProductNew: isProductNew ?? false,
          isProductNewAt: resolvedProductNewAt,
          isOnSale: isOnSale ?? false,
          isOnSaleAt: resolvedOnSaleAt,
          videoUrl: videoUrl !== undefined ? (videoUrl || null) : undefined,
          categories: {
            deleteMany: {},
            create: resolvedCategoryIds.map((categoryId) => ({ categoryId })),
          },
          garmentTypes: {
            deleteMany: {},
            create: resolvedGarmentTypeIds.map((garmentTypeId) => ({ garmentTypeId })),
          },
          isSet: isSet ?? false,
          metaTitle: name ? name.trim().slice(0, 60) : undefined,
          metaDescription: description != null
            ? description.replace(/\s+/g, " ").trim().slice(0, 160)
            : undefined,
        },
      });

      const slugForSku = product.slug;
      await createColorVariants(tx, id, slugForSku, colors || [], sizes || [], stock);
      if (isSet) {
        await createSetItems(tx, id, slugForSku, items || []);
      }

      return product;
    }, { timeout: 30000 });

    const nextAssetSet = new Set(nextAssetUrls);
    const urlsToDelete = previousAssetUrls.filter((url) => !nextAssetSet.has(url));
    if (urlsToDelete.length > 0) {
      try {
        await deleteMediaAssetsByUrls(urlsToDelete);
      } catch (mediaError) {
        console.error("[updateProduct] Error limpiando archivos en Bunny", mediaError);
      }
    }

    revalidatePath("/admin/productos");
    revalidatePath(`/product/${result.slug}`);
    revalidatePath("/product/[slug]", "page");
    revalidatePath("/");
    return { success: true, slug: result.slug };
  } catch (error) {
    console.error("[updateProduct]", error);
    return { success: false, error: "Error al actualizar el producto" };
  }
}
