"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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
type SubProductInput = {
  name: string;
  description?: string | null;
  price?: number | null;
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
  categoryId: string;
  status?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isProductNew?: boolean;
  isProductNewAt?: string | null;
  isOnSale?: boolean;
  isOnSaleAt?: string | null;
  material?: string | null;
  videoUrl?: string | null;
  isSet?: boolean;
  colors?: ColorInput[];
  sizes?: string[];
  items?: SetItemInput[];
  subProducts?: SubProductInput[];
};

// ── Constantes de validación ──────────────────────────────────────────────────

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

// ── Shared validation ────────────────────────────────────────────────────────

function validatePayload(payload: ProductPayload, isCreate: boolean): string | null {
  const { name, categoryId, basePrice, isSet, status, sizes, colors, subProducts } = payload;

  if (!name || typeof name !== "string" || name.trim().length < 3) {
    return "El nombre debe tener al menos 3 caracteres";
  }
  if (name.trim().length > 200) {
    return "El nombre no puede superar 200 caracteres";
  }
  if (!categoryId || typeof categoryId !== "string") {
    return "La categoría es requerida";
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
  if (!colors || colors.length === 0)
    return "Debes seleccionar al menos 1 color para el producto";
  if (!sizes || sizes.length === 0)
    return "Debes seleccionar al menos 1 talla para el producto";

  for (const c of colors) {
    if (!c.name || typeof c.name !== "string") return "Nombre de color inválido";
    if (!HEX_RE.test(c.hexCode || "")) {
      return `Código de color inválido: ${c.hexCode}`;
    }
  }

  // ── Sub-productos ─────────────────────────────────────────────────────────
  if (Array.isArray(subProducts) && subProducts.length > 0) {
    const subError = validateSubProducts(subProducts);
    if (subError) return subError;
  }

  return null;
}

function validateSubProducts(subProducts: SubProductInput[]): string | null {
  if (subProducts.length > 20) return "Demasiados sub-productos (máximo 20)";

  for (const sub of subProducts) {
    if (!sub.name || typeof sub.name !== "string" || sub.name.trim().length < 2)
      return "Nombre de sub-producto inválido (mínimo 2 caracteres)";
    if (sub.name.trim().length > 200)
      return "Nombre de sub-producto demasiado largo (máximo 200 caracteres)";

    if (sub.price !== undefined && sub.price !== null) {
      const p = Number(sub.price);
      if (isNaN(p) || p < 0) return "Precio de sub-producto inválido";
      if (p > 100_000_000) return "Precio de sub-producto parece inusualmente alto";
    }
    if (sub.videoUrl && typeof sub.videoUrl === "string") {
      try {
        const u = new URL(sub.videoUrl);
        if (u.protocol !== "https:" && u.protocol !== "http:")
          return "URL de video de sub-producto inválida";
      } catch {
        return "URL de video de sub-producto inválida";
      }
    }
    if (Array.isArray(sub.colors)) {
      if (sub.colors.length > 30) return "Demasiados colores en sub-producto";
      for (const c of sub.colors) {
        if (!c.name || typeof c.name !== "string") return "Nombre de color de sub-producto inválido";
        if (!HEX_RE.test(c.hexCode ?? "")) return `Código de color inválido en sub-producto: ${c.hexCode}`;
        if (c.variantStocks && typeof c.variantStocks === "object") {
          for (const [size, stockVal] of Object.entries(c.variantStocks)) {
            if (!ALLOWED_SIZES.includes(size as AllowedSize))
              return `Talla inválida en sub-producto: ${size}`;
            const s = Number(stockVal);
            if (isNaN(s) || s < 0) return `Stock inválido en sub-producto ${c.name} - ${size}`;
            if (s > 999_999) return `Stock excesivo en sub-producto ${c.name} - ${size}`;
          }
        }
      }
    }
  }

  return null;
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
async function createSubProductsLocal(tx: any, productId: string, slug: string, subProducts: SubProductInput[]) {
  for (let order = 0; order < subProducts.length; order++) {
    const sub = subProducts[order];
    if (!sub.name) continue;

    const hasVariantStocks = (sub.colors || []).some(
      (c) => c.variantStocks && Object.keys(c.variantStocks).length > 0
    );
    const subStock = sub.stock ?? 0;
    const totalVariants = (sub.colors?.length ?? 0) * (sub.sizes?.length ?? 0);
    const base = !hasVariantStocks && totalVariants > 0 ? Math.floor(subStock / totalVariants) : 0;
    const rem  = !hasVariantStocks && totalVariants > 0 ? subStock % totalVariants : 0;

    const computedStock = hasVariantStocks
      ? (sub.colors || []).reduce((total, c) =>
          total + Object.values(c.variantStocks ?? {}).reduce((s, v) => s + Number(v), 0), 0)
      : subStock;

    const subProduct = await tx.subProduct.create({
      data: {
        productId,
        name: sub.name.trim(),
        description: sub.description?.trim() || null,
        price: sub.price || null,
        stock: computedStock,
        videoUrl: sub.videoUrl || null,
        order,
      },
    });

    let idx = 0;
    for (const colorData of sub.colors || []) {
      if (!colorData.name) continue;
      const subColor = await tx.subProductColor.create({
        data: {
          subProductId: subProduct.id,
          name: colorData.name.trim(),
          hexCode: colorData.hexCode || "#000000",
        },
      });
      if (colorData.images?.length) {
        await tx.subProductImage.createMany({
          data: colorData.images.map((url: string, i: number) => ({
            colorId: subColor.id,
            url: url.trim(),
            altText: colorData.name || null,
            order: i,
          })),
        });
      }
      for (const size of sub.sizes || []) {
        const slugPart = (s: string) =>
          s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        const sku = `${slug}-sub-${slugPart(sub.name)}-${slugPart(colorData.name)}-${size.toLowerCase()}`;
        const variantStock =
          colorData.variantStocks?.[size] !== undefined
            ? Number(colorData.variantStocks[size])
            : base + (idx < rem ? 1 : 0);
        await tx.subProductVariant.create({
          data: { colorId: subColor.id, size: size as never, sku, stock: variantStock, isActive: true },
        });
        idx++;
      }
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

  try {
    const {
      name, description, categoryId, status, isFeatured, isNew,
      isProductNew, isProductNewAt, isOnSale, isOnSaleAt,
      material, videoUrl, isSet, colors, sizes, items, subProducts,
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
          categoryId,
          status: status || "ACTIVE",
          isFeatured: isFeatured || false,
          isNew: isNew || false,
          isProductNew: isProductNew || false,
          isProductNewAt: resolvedProductNewAt,
          isOnSale: isOnSale || false,
          isOnSaleAt: resolvedOnSaleAt,
          material: material || null,
          videoUrl: videoUrl || null,
          isSet: isSet || false,
          metaTitle: name.trim().slice(0, 60),
          metaDescription: (description || "").replace(/\s+/g, " ").trim().slice(0, 160),
        },
      });

      await createColorVariants(tx, product.id, slug, colors || [], sizes || [], stock);
      if (isSet) {
        await createSetItems(tx, product.id, slug, items || []);
      }
      if (Array.isArray(subProducts) && subProducts.length > 0) {
        await createSubProductsLocal(tx, product.id, slug, subProducts);
      }

      return product;
    });

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

  try {
    const {
      name, description, categoryId, status, isFeatured, isNew,
      isProductNew, isProductNewAt, isOnSale, isOnSaleAt,
      material, videoUrl, isSet, colors, sizes, items, subProducts,
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

    const result = await db.$transaction(async (tx: any) => {
      // Limpiar variantes, imágenes, items y sub-productos existentes antes de recrear
      await Promise.all([
        tx.productVariant.deleteMany({ where: { productId: id } }),
        tx.productImage.deleteMany({ where: { productId: id } }),
        tx.productItem.deleteMany({ where: { productId: id } }),
        tx.subProduct.deleteMany({ where: { productId: id } }),
      ]);
      await tx.productColor.deleteMany({ where: { productId: id } });

      const product = await tx.product.update({
        where: { id },
        data: {
          name,
          description,
          basePrice,
          comparePrice,
          categoryId,
          status,
          isFeatured,
          isNew,
          isProductNew: isProductNew ?? false,
          isProductNewAt: resolvedProductNewAt,
          isOnSale: isOnSale ?? false,
          isOnSaleAt: resolvedOnSaleAt,
          material: material || null,
          videoUrl: videoUrl !== undefined ? (videoUrl || null) : undefined,
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
      if (Array.isArray(subProducts) && subProducts.length > 0) {
        await createSubProductsLocal(tx, id, slugForSku, subProducts);
      }

      return product;
    }, { timeout: 30000 });

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
