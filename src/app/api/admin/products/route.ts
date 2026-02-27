import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// --- GET: Listar Productos (resumen para tabla) ---
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        images: {
          where: { colorId: null },
          orderBy: { order: "asc" },
          take: 1,
          select: { url: true },
        },
        colors: {
          take: 1,
          include: {
            images: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
          },
        },
        variants: { select: { stock: true } },
      },
    });

    const mapped = products.map((p) => {
      const generalImg = p.images[0]?.url;
      const colorImg = p.colors[0]?.images[0]?.url;
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
            : [],
        price: Number(p.basePrice),
        stock: p.variants.reduce((sum, v) => sum + v.stock, 0),
        active: p.status === "ACTIVE",
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// --- POST: Crear Producto completo ---
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id || token.role !== "ADMIN") {
      return new NextResponse("Acceso denegado", { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      description,
      basePrice,
      comparePrice,
      stock,
      categoryId,
      status,
      isFeatured,
      isNew,
      material,
      careInfo,
      videoUrl,
      colors,
      sizes,
    } = body;

    if (!name || !basePrice || !categoryId) {
      return new NextResponse("Faltan datos requeridos (nombre, precio, categoría)", { status: 400 });
    }

    const autoMetaTitle = name.trim().slice(0, 60);
    const autoMetaDescription = (description || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);

    const slug =
      name
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, "-")
        .replace(/^-+|-+$/g, "") +
      "-" +
      Date.now();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear producto
      const product = await tx.product.create({
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
          careInfo: careInfo || null,
          videoUrl: videoUrl || null,
          metaTitle: autoMetaTitle || null,
          metaDescription: autoMetaDescription || null,
        },
      });

      // 2. Colores × Tallas → variantes con stock distribuido
      const selectedColors: { name: string; hexCode: string }[] = colors || [];
      const selectedSizes: string[] = sizes || [];
      const globalStock = typeof stock === "number" ? stock : 0;
      const totalVariants = selectedColors.length * selectedSizes.length;
      const baseStockPerVariant = totalVariants > 0 ? Math.floor(globalStock / totalVariants) : 0;
      const remainder = totalVariants > 0 ? globalStock % totalVariants : 0;
      let variantIdx = 0;

      for (const colorData of selectedColors) {
        if (!colorData.name) continue;

        const color = await tx.productColor.create({
          data: {
            productId: product.id,
            name: colorData.name,
            hexCode: colorData.hexCode || "#000000",
          },
        });

        if (colorData.images?.length > 0) {
          await tx.productImage.createMany({
            data: colorData.images.map((url: string, i: number) => ({
              productId: product.id,
              colorId: color.id,
              url,
              altText: colorData.name,
              order: i,
            })),
          });
        }

        for (const size of selectedSizes) {
          const sku = `${slug}-${colorData.name.toLowerCase().replace(/\s+/g, "-")}-${size.toLowerCase()}`;
          await tx.productVariant.create({
            data: {
              productId: product.id,
              colorId: color.id,
              size: size as "XS" | "S" | "M" | "L" | "XL" | "XXL" | "ONESIZE",
              sku,
              stock: baseStockPerVariant + (variantIdx < remainder ? 1 : 0),
            },
          });
          variantIdx++;
        }
      }

      return product;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[PRODUCTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
