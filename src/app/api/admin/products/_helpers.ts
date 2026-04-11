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
          isCover: i === 0, // La primera imagen (order=0) es la portada
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
            isCover: i === 0, // La primera imagen (order=0) es la portada de la subcategoría
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

