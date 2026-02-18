import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// --- GET: Obtener producto completo por ID ---
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        images: { orderBy: { order: "asc" } },
        colors: {
          include: {
            images: { orderBy: { order: "asc" } },
            variants: true,
          },
        },
      },
    });

    if (!product) {
      return new NextResponse("Producto no encontrado", { status: 404 });
    }

    const mapped = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      basePrice: Number(product.basePrice),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      categoryId: product.categoryId,
      status: product.status,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      material: product.material,
      careInfo: product.careInfo,
      generalImages: product.images
        .filter((img) => !img.colorId)
        .map((img) => img.url),
      colors: product.colors.map((c) => ({
        id: c.id,
        name: c.name,
        hexCode: c.hexCode,
        images: c.images.map((img) => img.url),
        variants: c.variants.map((v) => ({
          size: v.size,
          stock: v.stock,
          priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
        })),
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
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id || token.role !== "ADMIN") {
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

    const slug = name
      ? name
          .toLowerCase()
          .trim()
          .replace(/[\s\W-]+/g, "-")
          .replace(/^-+|-+$/g, "")
      : undefined;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Eliminar imágenes existentes
      await tx.productImage.deleteMany({ where: { productId: id } });

      // 2. Eliminar colores (cascadea a variantes)
      await tx.productColor.deleteMany({ where: { productId: id } });

      // 3. Actualizar producto
      const product = await tx.product.update({
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
          material: material || null,
          careInfo: careInfo || null,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
        },
      });

      // 4. Recrear imágenes generales
      if (generalImages && generalImages.length > 0) {
        await tx.productImage.createMany({
          data: generalImages.map((url: string, i: number) => ({
            productId: id,
            url,
            altText: name || product.name,
            order: i,
          })),
        });
      }

      // 5. Recrear colores, sus imágenes y variantes
      if (colors && colors.length > 0) {
        for (const colorData of colors) {
          if (!colorData.name) continue;

          const color = await tx.productColor.create({
            data: {
              productId: id,
              name: colorData.name,
              hexCode: colorData.hexCode || "#000000",
            },
          });

          if (colorData.images && colorData.images.length > 0) {
            await tx.productImage.createMany({
              data: colorData.images.map((url: string, i: number) => ({
                productId: id,
                colorId: color.id,
                url,
                altText: `${name || product.name} - ${colorData.name}`,
                order: i,
              })),
            });
          }

          if (colorData.variants && colorData.variants.length > 0) {
            for (const variant of colorData.variants) {
              if (!variant.stock || variant.stock <= 0) continue;
              const sku = `${slug || product.slug}-${colorData.name.toLowerCase().replace(/\s+/g, "-")}-${variant.size.toLowerCase()}`;
              await tx.productVariant.create({
                data: {
                  productId: id,
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
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id || token.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productColor.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
