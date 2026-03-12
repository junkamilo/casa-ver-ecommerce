import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// --- GET: Listar Productos (resumen para tabla) ---
export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products: any[] = await db.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        images: { where: { colorId: null }, orderBy: { order: "asc" }, take: 1, select: { url: true } },
        colors: { take: 1, include: { images: { orderBy: { order: "asc" }, take: 1, select: { url: true } } } },
        variants: { select: { stock: true } },
        items: { take: 1, include: { colors: { take: 1, include: { images: { take: 1 } } } } },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped = products.map((p: any) => {
      const generalImg = p.images[0]?.url;
      const colorImg = p.colors[0]?.images[0]?.url;
      const setItemImg = p.items?.[0]?.colors?.[0]?.images?.[0]?.url;
      const regularStock = p.variants.reduce((sum: number, v: any) => sum + v.stock, 0);

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        categoryId: p.categoryId,
        category: p.category,
        images: generalImg
          ? [{ url: generalImg }]
          : colorImg
            ? [{ url: colorImg }]
            : setItemImg
              ? [{ url: setItemImg }]
              : [],
        price: Number(p.basePrice),
        stock: regularStock,
        active: p.status === "ACTIVE",
        isSet: p.isSet ?? false,
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

type ColorInput = { name: string; hexCode: string; images?: string[] };
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

// --- POST: Crear Producto completo ---
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id || token.role !== "ADMIN") {
      return new NextResponse("Acceso denegado", { status: 403 });
    }

    const body = await req.json();
    const {
      name, description, basePrice, comparePrice, stock,
      categoryId, status, isFeatured, isNew, material,
      videoUrl, isSet, colors, sizes, items, subProducts,
    } = body;

    if (!name || !basePrice || !categoryId) {
      return new NextResponse("Faltan datos requeridos (nombre, precio, categoría)", { status: 400 });
    }

    const slug =
      name.toLowerCase().trim().replace(/[\s\W-]+/g, "-").replace(/^-+|-+$/g, "") +
      "-" + Date.now();

    const result = await prisma.$transaction(async (tx) => {
      const product = await (tx as any).product.create({
        data: {
          name,
          slug,
          description: description || "",
          basePrice,
          comparePrice: comparePrice || null,
          categoryId,
          status: status || "ACTIVE",
          isFeatured: isFeatured || false,
          isNew: isNew || false,
          material: material || null,
          videoUrl: videoUrl || null,
          isSet: isSet || false,
          metaTitle: name.trim().slice(0, 60),
          metaDescription: (description || "").replace(/\s+/g, " ").trim().slice(0, 160),
          subProducts: (subProducts as SubProductInput[] | undefined)?.length
            ? {
                create: (subProducts as SubProductInput[]).map((sub, order) => {
                  const totalVariants = Math.max(
                    (sub.colors?.filter(c => c.name).length || 0) * (sub.sizes?.length || 0),
                    1
                  );
                  const stockPerVariant = Math.floor((sub.stock || 0) / totalVariants);
                  return {
                    name: sub.name,
                    description: sub.description || null,
                    price: sub.price || null,
                    stock: sub.stock || 0,
                    videoUrl: sub.videoUrl || null,
                    order,
                    colors: {
                      create: (sub.colors || []).filter(c => c.name).map(colorData => ({
                        name: colorData.name,
                        hexCode: colorData.hexCode || "#000000",
                        images: colorData.images?.length
                          ? { create: colorData.images.map((url, i) => ({ url, altText: colorData.name, order: i })) }
                          : undefined,
                        variants: sub.sizes?.length
                          ? {
                              create: sub.sizes.map(size => ({
                                size: size as never,
                                sku: `${slug}-sub-${sub.name.toLowerCase().replace(/\s+/g, "-")}-${colorData.name.toLowerCase().replace(/\s+/g, "-")}-${size.toLowerCase()}`,
                                stock: stockPerVariant,
                                isActive: true,
                              })),
                            }
                          : undefined,
                      })),
                    },
                  };
                }),
              }
            : undefined,
        },
      });

      // Parent product colors are ALWAYS created regardless of isSet.
      // When isSet=true, subcategory items are created on top.
      await createColorVariants(tx, product.id, slug, colors || [], sizes || [], stock ?? 0);
      if (isSet) {
        await createSetItems(tx, product.id, slug, items || []);
      }

      return product;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[PRODUCTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ── Helpers compartidos ──────────────────────────────────────────────────────

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
      await tx.productVariant.create({
        data: { productId, colorId: color.id, size: size as never, sku, stock: base + (idx < rem ? 1 : 0) },
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
    const totalVariants = (itemData.colors?.length ?? 0) * (itemData.sizes?.length ?? 0);
    const base = totalVariants > 0 ? Math.floor(itemStock / totalVariants) : 0;
    const rem = totalVariants > 0 ? itemStock % totalVariants : 0;
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
        await tx.productItemVariant.create({
          data: { colorId: itemColor.id, size: size as never, sku, stock: base + (idx < rem ? 1 : 0) },
        });
        idx++;
      }
    }
  }
}
