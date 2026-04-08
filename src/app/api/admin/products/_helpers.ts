// ── Tipos compartidos ─────────────────────────────────────────────────────────

export type ColorInput = {
  name: string;
  hexCode: string;
  images?: string[];
  variantStocks?: { [size: string]: number };
};

export type SetItemInput = {
  name: string;
  description?: string | null;
  price?: number | null;
  comparePrice?: number | null;
  videoUrl?: string | null;
  stock?: number;
  colors: ColorInput[];
  sizes: string[];
};

export type SubProductInput = {
  name: string;
  description?: string | null;
  price?: number | null;
  stock?: number;
  videoUrl?: string | null;
  colors: ColorInput[];
  sizes: string[];
};

// ── SKU sanitization ──────────────────────────────────────────────────────────

/**
 * Normaliza un string para uso en SKUs.
 * Quita acentos (é→e, ñ→n, ü→u), reemplaza todo lo no alfanumérico con guiones.
 * Ej: "Azul Océano" → "azul-oceano", "Rojo/Naranja" → "rojo-naranja"
 */
export function toSlugPart(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // quitar marcas diacríticas (acentos)
    .replace(/[^a-z0-9]+/g, "-")       // todo lo no alfanumérico → guión
    .replace(/^-+|-+$/g, "");          // quitar guiones al inicio y al fin
}

// ── Helpers de base de datos ──────────────────────────────────────────────────

/**
 * Crea los colores, imágenes y variantes de stock del producto padre.
 * Se usa tanto en POST (crear) como en PATCH (actualizar) después de limpiar los registros anteriores.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createColorVariants(
  tx: any,
  productId: string,
  slug: string,
  colors: ColorInput[],
  sizes: string[],
  globalStock: number
) {
  const hasVariantStocks = colors.some(
    (c) => c.variantStocks && Object.keys(c.variantStocks).length > 0
  );
  const totalVariants = colors.length * sizes.length;
  const base = !hasVariantStocks && totalVariants > 0 ? Math.floor(globalStock / totalVariants) : 0;
  const rem  = !hasVariantStocks && totalVariants > 0 ? globalStock % totalVariants : 0;
  let idx = 0;

  for (const colorData of colors) {
    if (!colorData.name) continue;

    const color = await tx.productColor.create({
      data: { productId, name: colorData.name, hexCode: colorData.hexCode || "#000000" },
    });

    const cleanImages = (colorData.images ?? []).filter(
      (url: string) => typeof url === "string" && url.trim()
    );
    if (cleanImages.length) {
      await tx.productImage.createMany({
        data: cleanImages.map((url: string, i: number) => ({
          productId,
          colorId: color.id,
          url: url.trim(),
          altText: colorData.name || null,
          order: i,
        })),
      });
    }

    for (const size of sizes) {
      // toSlugPart: quita acentos y caracteres especiales del nombre del color en el SKU
      const sku = `${slug}-${toSlugPart(colorData.name)}-${size.toLowerCase()}`;
      const variantStock =
        colorData.variantStocks?.[size] !== undefined
          ? Number(colorData.variantStocks[size])
          : base + (idx < rem ? 1 : 0);

      await tx.productVariant.create({
        data: {
          productId,
          colorId: color.id,
          size: size as never,
          sku,
          stock: variantStock,
          minStock: 2,
        },
      });
      idx++;
    }
  }
}

/**
 * Crea las subcategorías (ProductItem) con sus colores, imágenes y variantes.
 * Sólo se llama cuando isSet=true.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createSetItems(
  tx: any,
  productId: string,
  slug: string,
  items: SetItemInput[]
) {
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
    const rem  = !hasVariantStocks && totalVariants > 0 ? itemStock % totalVariants : 0;
    let idx = 0;

    for (const colorData of itemData.colors || []) {
      if (!colorData.name) continue;

      const itemColor = await tx.productItemColor.create({
        data: { itemId: productItem.id, name: colorData.name, hexCode: colorData.hexCode || "#000000" },
      });

      const cleanItemImages = (colorData.images ?? []).filter(
        (url: string) => typeof url === "string" && url.trim()
      );
      if (cleanItemImages.length) {
        await tx.productItemImage.createMany({
          data: cleanItemImages.map((url: string, i: number) => ({
            colorId: itemColor.id,
            url: url.trim(),
            altText: colorData.name || null,
            order: i,
          })),
        });
      }

      for (const size of itemData.sizes || []) {
        const sku = `${slug}-${toSlugPart(itemData.name)}-${toSlugPart(colorData.name)}-${size.toLowerCase()}`;
        const variantStock =
          colorData.variantStocks?.[size] !== undefined
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

/**
 * Crea los subproductos vendibles de forma independiente (SubProduct).
 * Respeta los stocks por variante cuando se proporcionan (variantStocks),
 * o distribuye el stock global equitativamente entre todas las variantes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createSubProducts(
  tx: any,
  productId: string,
  slug: string,
  subProducts: SubProductInput[]
) {
  for (let order = 0; order < subProducts.length; order++) {
    const sub = subProducts[order];
    if (!sub.name) continue;

    // Calcular stock total: suma de variantStocks si existen, si no usar sub.stock
    const hasVariantStocks = (sub.colors || []).some(
      (c) => c.variantStocks && Object.keys(c.variantStocks).length > 0
    );
    const subStock = sub.stock ?? 0;
    const totalVariants = (sub.colors?.length ?? 0) * (sub.sizes?.length ?? 0);
    const base = !hasVariantStocks && totalVariants > 0 ? Math.floor(subStock / totalVariants) : 0;
    const rem  = !hasVariantStocks && totalVariants > 0 ? subStock % totalVariants : 0;

    // Stock real = suma de todos los variantStocks si están definidos
    const computedStock = hasVariantStocks
      ? (sub.colors || []).reduce((total, c) =>
          total + Object.values(c.variantStocks ?? {}).reduce((s, v) => s + Number(v), 0), 0)
      : subStock;

    const subProduct = await tx.subProduct.create({
      data: {
        productId,
        name: sub.name,
        description: sub.description || null,
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
        data: { subProductId: subProduct.id, name: colorData.name, hexCode: colorData.hexCode || "#000000" },
      });

      const cleanSubImages = (colorData.images ?? []).filter(
        (url: string) => typeof url === "string" && url.trim()
      );
      if (cleanSubImages.length) {
        await tx.subProductImage.createMany({
          data: cleanSubImages.map((url: string, i: number) => ({
            colorId: subColor.id,
            url: url.trim(),
            altText: colorData.name || null,
            order: i,
          })),
        });
      }

      for (const size of sub.sizes || []) {
        const sku = `${slug}-sub-${toSlugPart(sub.name)}-${toSlugPart(colorData.name)}-${size.toLowerCase()}`;
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
