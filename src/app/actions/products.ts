"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

type ColorInput = { name: string; hexCode: string; images?: string[]; variantStocks?: { [size: string]: number } };
type SetItemInput = {
  name: string;
  description?: string | null;
  price?: number | null;
  videoUrl?: string | null;
  stock?: number;
  colors: ColorInput[];
  sizes: string[];
};
type SubProductInput = {
  name: string;
  description?: string | null;
  price?: number | null;
  stock?: number;
  videoUrl?: string | null;
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
      data: { productId, name: itemData.name, description: itemData.description || null, price: itemData.price || null, videoUrl: itemData.videoUrl || null, order },
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

  try {
    const {
      name, description, categoryId, status, isFeatured, isNew,
      isProductNew, isProductNewAt, isOnSale, isOnSaleAt,
      material, videoUrl, isSet, colors, sizes, items, subProducts,
    } = payload;

    // Conversión explícita — idéntica a updateProduct
    const basePrice    = parseFloat(String(payload.basePrice));
    const comparePrice = payload.comparePrice != null ? parseFloat(String(payload.comparePrice)) : null;
    const stock        = parseInt(String(payload.stock ?? 0), 10);

    const slug =
      name.toLowerCase().trim().replace(/[\s\W-]+/g, "-").replace(/^-+|-+$/g, "") +
      "-" + Date.now();

    // Si se activa isProductNew ahora mismo, usar timestamp actual
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
      if (subProducts?.length) {
        for (let order = 0; order < subProducts.length; order++) {
          const sub = subProducts[order];
          if (!sub.name) continue;
          const subProduct = await tx.subProduct.create({
            data: { productId: product.id, name: sub.name, description: sub.description || null, price: sub.price || null, stock: sub.stock || 0, videoUrl: sub.videoUrl || null, order },
          });
          const subStock = sub.stock ?? 0;
          const totalVariants = (sub.colors?.length ?? 0) * (sub.sizes?.length ?? 0);
          const base = totalVariants > 0 ? Math.floor(subStock / totalVariants) : 0;
          const rem = totalVariants > 0 ? subStock % totalVariants : 0;
          let idx = 0;
          for (const colorData of sub.colors || []) {
            if (!colorData.name) continue;
            const subColor = await tx.subProductColor.create({
              data: { subProductId: subProduct.id, name: colorData.name, hexCode: colorData.hexCode || "#000000" },
            });
            if (colorData.images?.length) {
              await tx.subProductImage.createMany({
                data: colorData.images.map((url: string, i: number) => ({ colorId: subColor.id, url, altText: colorData.name, order: i })),
              });
            }
            for (const size of sub.sizes || []) {
              const sku = `${slug}-sub-${sub.name.toLowerCase().replace(/\s+/g, "-")}-${colorData.name.toLowerCase().replace(/\s+/g, "-")}-${size.toLowerCase()}`;
              await tx.subProductVariant.create({
                data: { colorId: subColor.id, size: size as never, sku, stock: base + (idx < rem ? 1 : 0) },
              });
              idx++;
            }
          }
        }
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

  try {
    const {
      name, description, categoryId, status, isFeatured, isNew,
      isProductNew, isProductNewAt, isOnSale, isOnSaleAt,
      material, videoUrl, isSet, colors, sizes, items, subProducts,
    } = payload;

    // Conversión explícita a tipos numéricos correctos
    const basePrice  = payload.basePrice  != null ? parseFloat(String(payload.basePrice))  : undefined;
    const comparePrice = payload.comparePrice != null ? parseFloat(String(payload.comparePrice)) : null;
    const stock      = parseInt(String(payload.stock ?? 0), 10);

    const slug = name
      ? name.toLowerCase().trim().replace(/[\s\W-]+/g, "-").replace(/^-+|-+$/g, "")
      : undefined;

    // Si se activa isProductNew, usar timestamp del payload o generar uno nuevo
    const resolvedProductNewAt = isProductNew
      ? (isProductNewAt ? new Date(isProductNewAt) : new Date())
      : null;
    const resolvedOnSaleAt = isOnSale
      ? (isOnSaleAt ? new Date(isOnSaleAt) : new Date())
      : null;

    const result = await db.$transaction(async (tx: any) => {
      // Eliminar en paralelo lo que no tiene dependencias entre sí
      // (timeout extendido a 30s para cubrir productos con muchas variantes)
      await Promise.all([
        tx.productVariant.deleteMany({ where: { productId: id } }),
        tx.productImage.deleteMany({ where: { productId: id } }),
        tx.productItem.deleteMany({ where: { productId: id } }),
        tx.subProduct.deleteMany({ where: { productId: id } }),
      ]);
      // productColor depende de productVariant/productImage (FK)
      await tx.productColor.deleteMany({ where: { productId: id } });

      const product = await tx.product.update({
        where: { id },
        data: {
          name,
          slug,
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

      const slugForSku = slug || product.slug;
      await createColorVariants(tx, id, slugForSku, colors || [], sizes || [], stock);
      if (isSet) {
        await createSetItems(tx, id, slugForSku, items || []);
      }
      if (subProducts?.length) {
        for (let order = 0; order < subProducts.length; order++) {
          const sub = subProducts[order];
          if (!sub.name) continue;
          const subProduct = await tx.subProduct.create({
            data: { productId: id, name: sub.name, description: sub.description || null, price: sub.price || null, stock: sub.stock || 0, videoUrl: sub.videoUrl || null, order },
          });
          const subStock = sub.stock ?? 0;
          const totalVariants = (sub.colors?.length ?? 0) * (sub.sizes?.length ?? 0);
          const base = totalVariants > 0 ? Math.floor(subStock / totalVariants) : 0;
          const rem = totalVariants > 0 ? subStock % totalVariants : 0;
          let idx = 0;
          for (const colorData of sub.colors || []) {
            if (!colorData.name) continue;
            const subColor = await tx.subProductColor.create({
              data: { subProductId: subProduct.id, name: colorData.name, hexCode: colorData.hexCode || "#000000" },
            });
            if (colorData.images?.length) {
              await tx.subProductImage.createMany({
                data: colorData.images.map((url: string, i: number) => ({ colorId: subColor.id, url, altText: colorData.name, order: i })),
              });
            }
            for (const size of sub.sizes || []) {
              const sku = `${slugForSku}-sub-${sub.name.toLowerCase().replace(/\s+/g, "-")}-${colorData.name.toLowerCase().replace(/\s+/g, "-")}-${size.toLowerCase()}`;
              await tx.subProductVariant.create({
                data: { colorId: subColor.id, size: size as never, sku, stock: base + (idx < rem ? 1 : 0) },
              });
              idx++;
            }
          }
        }
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
