import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

// --- GET: Obtener producto completo por ID ---
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Acceso denegado", { status: 403 });
    }
    const { id } = await params;

    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        images: { orderBy: { order: "asc" } },
        colors: { include: { images: { orderBy: { order: "asc" } }, variants: true } },
        items: {
          orderBy: { order: "asc" },
          include: {
            colors: {
              include: {
                images: { orderBy: { order: "asc" } },
                variants: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return new NextResponse("Producto no encontrado", { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalStock = product.colors.reduce((sum: number, c: any) =>
      sum + c.variants.reduce((s: number, v: any) => s + v.stock, 0), 0
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allSizes = [...new Set(product.colors.flatMap((c: any) => c.variants.map((v: any) => v.size)))];

    const mapped = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      basePrice: Number(product.basePrice),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      stock: totalStock,
      categoryId: product.categoryId,
      status: product.status,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      isSet: product.isSet ?? false,
      isProductNew: product.isProductNew ?? false,
      isProductNewAt: product.isProductNewAt ?? null,
      isOnSale: product.isOnSale ?? false,
      isOnSaleAt: product.isOnSaleAt ?? null,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      material: product.material,
      videoUrl: product.videoUrl,
      generalImages: product.images
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((img: any) => !img.colorId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((img: any) => img.url),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      colors: product.colors.map((c: any) => ({
        id: c.id,
        name: c.name,
        hexCode: c.hexCode,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        images: c.images.map((img: any) => img.url),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        variantStocks: Object.fromEntries(c.variants.map((v: any) => [v.size, v.stock])),
      })),
      sizes: allSizes,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      variants: product.colors.flatMap((c: any) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        c.variants.map((v: any) => ({
          id: v.id,
          colorId: c.id,
          colorName: c.name,
          size: v.size,
          stock: v.stock,
        }))
      ),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: (product.items || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description ?? null,
        price: item.price ? Number(item.price) : null,
        videoUrl: item.videoUrl,
        order: item.order,
        stock: item.colors.reduce(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (acc: number, c: any) => acc + c.variants.reduce((s: number, v: any) => s + v.stock, 0), 0
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        colors: item.colors.map((c: any) => ({
          id: c.id,
          name: c.name,
          hexCode: c.hexCode,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          images: c.images.map((img: any) => img.url),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          variantStocks: Object.fromEntries(c.variants.map((v: any) => [v.size, v.stock])),
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sizes: [...new Set(item.colors.flatMap((c: any) => c.variants.map((v: any) => v.size)))],
      })),
    };

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("[PRODUCT_GET_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// --- PATCH: Actualizar Producto completo ---
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    // Toggle rápido de active (desde la tabla)
    if (body.active !== undefined && Object.keys(body).length === 1) {
      const product = await prisma.product.update({
        where: { id },
        data: { status: body.active ? "ACTIVE" : "INACTIVE" },
      });
      return NextResponse.json(product);
    }

    const {
      name, description, basePrice, comparePrice, stock,
      categoryId, status, isFeatured, isNew,
      isProductNew, isProductNewAt, isOnSale, isOnSaleAt,
      material, videoUrl, isSet, colors, sizes, items, subProducts,
    } = body;

    const slug = name
      ? name.toLowerCase().trim().replace(/[\s\W-]+/g, "-").replace(/^-+|-+$/g, "")
      : undefined;

    const resolvedProductNewAt = isProductNew
      ? (isProductNewAt ? new Date(isProductNewAt) : new Date())
      : null;
    const resolvedOnSaleAt = isOnSale
      ? (isOnSaleAt ? new Date(isOnSaleAt) : new Date())
      : null;

    const result = await prisma.$transaction(async (tx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const txDb = tx as any;

      // 1. Eliminar imágenes existentes (product level)
      await txDb.productImage.deleteMany({ where: { productId: id } });

      // 2. Eliminar colores y variantes del producto simple
      await txDb.productColor.deleteMany({ where: { productId: id } });

      // 3. Eliminar items del conjunto (cascade a colors/images/variants)
      await txDb.productItem.deleteMany({ where: { productId: id } });

      // 4a. Eliminar subproductos (cascade a colors/images/variants)
      await txDb.subProduct.deleteMany({ where: { productId: id } });

      // 4. Actualizar producto
      const product = await txDb.product.update({
        where: { id },
        data: {
          name,
          slug,
          description,
          basePrice: basePrice != null ? basePrice : undefined,
          comparePrice: comparePrice != null ? comparePrice : undefined,
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

      // Parent product colors are ALWAYS recreated regardless of isSet.
      // When isSet=true, subcategory items are created on top.
      await createColorVariants(txDb, id, slugForSku, colors || [], sizes || [], stock ?? 0);
      if (isSet) {
        await createSetItems(txDb, id, slugForSku, items || []);
      }
      if (subProducts?.length) {
        await createSubProducts(txDb, id, slugForSku, subProducts);
      }

      return product;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// --- DELETE: Eliminar Producto ---
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const txDb = tx as any;
      await txDb.productImage.deleteMany({ where: { productId: id } });
      await txDb.productColor.deleteMany({ where: { productId: id } });
      await txDb.productItem.deleteMany({ where: { productId: id } });
      await txDb.subProduct.deleteMany({ where: { productId: id } });
      await txDb.product.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createColorVariants(tx: any, productId: string, slug: string, colors: ColorInput[], sizes: string[], globalStock: number) {
  // Si hay variantStocks proporcionados, usarlos; de lo contrario, dividir el stock global uniformemente
  const hasVariantStocks = colors.some((c) => c.variantStocks && Object.keys(c.variantStocks).length > 0);

  const totalVariants = colors.length * sizes.length;
  const base = !hasVariantStocks && totalVariants > 0 ? Math.floor(globalStock / totalVariants) : 0;
  const rem = !hasVariantStocks && totalVariants > 0 ? globalStock % totalVariants : 0;
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
      // Usar variantStocks si existen; si no, usar división uniforme con minStock = 2
      const variantStock = colorData.variantStocks?.[size] !== undefined
        ? Number(colorData.variantStocks[size])
        : base + (idx < rem ? 1 : 0);

      await tx.productVariant.create({
        data: {
          productId,
          colorId: color.id,
          size: size as never,
          sku,
          stock: variantStock,
          minStock: 2, // minStock fijo en 2 como especificó el cliente
        },
      });
      idx++;
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createSubProducts(tx: any, productId: string, slug: string, subProducts: SubProductInput[]) {
  for (let order = 0; order < subProducts.length; order++) {
    const sub = subProducts[order];
    if (!sub.name) continue;

    const subProduct = await tx.subProduct.create({
      data: { productId, name: sub.name, description: sub.description || null, price: sub.price || null, stock: sub.stock || 0, videoUrl: sub.videoUrl || null, order },
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
          data: colorData.images.map((url: string, i: number) => ({
            colorId: subColor.id, url, altText: colorData.name, order: i,
          })),
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
