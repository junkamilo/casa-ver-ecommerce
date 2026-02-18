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
      categoryId,
      status,
      isFeatured,
      isNew,
      material,
      careInfo,
      metaTitle,
      metaDescription,
      generalImages,
      colors,
    } = body;

    if (!name || !basePrice || !categoryId) {
      return new NextResponse("Faltan datos requeridos (nombre, precio, categoría)", { status: 400 });
    }

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
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
        },
      });

      // 2. Imágenes generales
      if (generalImages && generalImages.length > 0) {
        await tx.productImage.createMany({
          data: generalImages.map((url: string, i: number) => ({
            productId: product.id,
            url,
            altText: name,
            order: i,
          })),
        });
      }

      // 3. Colores con sus imágenes y variantes
      if (colors && colors.length > 0) {
        for (const colorData of colors) {
          if (!colorData.name) continue;

          const color = await tx.productColor.create({
            data: {
              productId: product.id,
              name: colorData.name,
              hexCode: colorData.hexCode || "#000000",
            },
          });

          // Imágenes del color
          if (colorData.images && colorData.images.length > 0) {
            await tx.productImage.createMany({
              data: colorData.images.map((url: string, i: number) => ({
                productId: product.id,
                colorId: color.id,
                url,
                altText: `${name} - ${colorData.name}`,
                order: i,
              })),
            });
          }

          // Variantes del color
          if (colorData.variants && colorData.variants.length > 0) {
            for (const variant of colorData.variants) {
              if (!variant.stock || variant.stock <= 0) continue;
              const sku = `${slug}-${colorData.name.toLowerCase().replace(/\s+/g, "-")}-${variant.size.toLowerCase()}`;
              await tx.productVariant.create({
                data: {
                  productId: product.id,
                  colorId: color.id,
                  size: variant.size,
                  sku,
                  stock: variant.stock,
                  priceOverride: variant.priceOverride || null,
                },
              });
            }
          }
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
