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
            variants: true,
          },
        },
      },
    });

    if (!product) {
      return new NextResponse("Producto no encontrado", { status: 404 });
    }

    const totalStock = product.colors.reduce(
      (sum, c) => sum + c.variants.reduce((s, v) => s + v.stock, 0),
      0
    );

    const allSizes = [
      ...new Set(product.colors.flatMap((c) => c.variants.map((v) => v.size))),
    ];

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
      })),
      sizes: allSizes,
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
      stock,
      categoryId,
      status,
      isFeatured,
      isNew,
      material,
      careInfo,
      generalImages,
      colors,
      sizes,
    } = body;

    const autoMetaTitle = name ? name.trim().slice(0, 60) : undefined;
    const autoMetaDescription = description != null
      ? description.replace(/\s+/g, " ").trim().slice(0, 160)
      : undefined;

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
          metaTitle: autoMetaTitle || null,
          metaDescription: autoMetaDescription || null,
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

      // 5. Recrear colores × tallas → variantes con stock distribuido
      const selectedColors: { name: string; hexCode: string }[] = colors || [];
      const selectedSizes: string[] = sizes || [];
      const globalStock = typeof stock === "number" ? stock : 0;
      const totalVariants = selectedColors.length * selectedSizes.length;
      const baseStockPerVariant = totalVariants > 0 ? Math.floor(globalStock / totalVariants) : 0;
      const remainder = totalVariants > 0 ? globalStock % totalVariants : 0;
      const slugForSku = slug || product.slug;
      let variantIdx = 0;

      for (const colorData of selectedColors) {
        if (!colorData.name) continue;

        const color = await tx.productColor.create({
          data: {
            productId: id,
            name: colorData.name,
            hexCode: colorData.hexCode || "#000000",
          },
        });

        for (const size of selectedSizes) {
          const sku = `${slugForSku}-${colorData.name.toLowerCase().replace(/\s+/g, "-")}-${size.toLowerCase()}`;
          await tx.productVariant.create({
            data: {
              productId: id,
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
