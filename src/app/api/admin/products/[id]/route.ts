import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { createColorVariants, createSetItems } from "../_helpers";

// ── Constantes permitidas ─────────────────────────────────────────────────────

const ALLOWED_STATUSES = ["ACTIVE", "INACTIVE"] as const;
const ALLOWED_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "ONESIZE"] as const;
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

// ── Helpers de validación ─────────────────────────────────────────────────────

/** Valida URLs de video — permite http/https (YouTube, Vimeo, Cloudinary) */
function isHttpUrl(v: unknown): boolean {
  if (typeof v !== "string" || !v) return false;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Valida URLs de imágenes de producto.
 * Solo acepta archivos servidos desde Cloudinary (res.cloudinary.com).
 * Previene inyección de URLs externas arbitrarias en la base de datos.
 */
function isValidImageUrl(v: unknown): boolean {
  if (typeof v !== "string" || !v.trim()) return false;
  try {
    const u = new URL(v);
    return u.protocol === "https:" && u.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

/** Parsea fecha ISO de forma segura — retorna null si el string es inválido */
function parseSafeDate(v: unknown): Date | null {
  if (!v || typeof v !== "string") return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateProductBody(body: any): string | null {
  const {
    name, categoryId, description, basePrice, comparePrice,
    stock, status, sizes, colors, items, videoUrl, isSet,
  } = body;

  // ── Nombre ────────────────────────────────────────────────────────────────
  if (!name || typeof name !== "string" || name.trim().length < 3)
    return "El nombre debe tener al menos 3 caracteres";
  if (name.trim().length > 200)
    return "El nombre no puede superar 200 caracteres";

  // ── Categoría ─────────────────────────────────────────────────────────────
  if (!categoryId || typeof categoryId !== "string" || !categoryId.trim())
    return "La categoría es requerida";
  if (categoryId.trim().length > 50)
    return "ID de categoría inválido";

  // ── Descripción ───────────────────────────────────────────────────────────
  if (!isSet) {
    if (!description || typeof description !== "string" || description.trim().length < 10)
      return "La descripción debe tener al menos 10 caracteres";
    if (description.trim().length > 5000)
      return "La descripción no puede superar 5000 caracteres";
  }

  // ── Precio ────────────────────────────────────────────────────────────────
  if (!isSet) {
    const price = Number(basePrice);
    if (isNaN(price) || price <= 0) return "El precio debe ser mayor a 0";
  }

  if (comparePrice !== undefined && comparePrice !== null && comparePrice !== "") {
    const cp = Number(comparePrice);
    if (isNaN(cp) || cp < 0) return "El precio de comparación no es válido";
  }

  // ── Stock ─────────────────────────────────────────────────────────────────
  const globalStock = Number(stock ?? 0);
  if (!isNaN(globalStock) && globalStock > 9_999_999)
    return "El stock total parece inusualmente alto";

  // ── Estado ────────────────────────────────────────────────────────────────
  if (status && !ALLOWED_STATUSES.includes(status as never))
    return `Estado inválido: ${status}`;

  // ── Tallas ────────────────────────────────────────────────────────────────
  if (Array.isArray(sizes)) {
    if (sizes.length > 20) return "Demasiadas tallas (máximo 20)";
    const invalid = sizes.filter((s: unknown) => !ALLOWED_SIZES.includes(s as never));
    if (invalid.length) return `Tallas inválidas: ${invalid.join(", ")}`;
  }

  // ── Colores y tallas requeridos (solo para productos simples) ────────────
  // isSet=true: los colores/tallas viven en las subcategorías, no en el padre
  if (!isSet) {
    if (!Array.isArray(colors) || colors.length === 0)
      return "Debes seleccionar al menos 1 color para el producto";
    if (!Array.isArray(sizes) || sizes.length === 0)
      return "Debes seleccionar al menos 1 talla para el producto";
  }

  // ── Colores ───────────────────────────────────────────────────────────────
  if (colors.length > 30) return "Demasiados colores (máximo 30)";
  for (const c of colors) {
    if (!c.name || typeof c.name !== "string") return "Nombre de color inválido";
    if (c.name.trim().length > 100) return "Nombre de color demasiado largo";
    if (!HEX_RE.test(c.hexCode ?? "")) return `Código de color inválido: ${c.hexCode}`;
    if (c.variantStocks && typeof c.variantStocks === "object") {
      for (const [size, stockVal] of Object.entries(c.variantStocks)) {
        if (!ALLOWED_SIZES.includes(size as never)) return `Talla inválida en stock: ${size}`;
        const s = Number(stockVal);
        if (isNaN(s) || s < 0) return `Stock inválido para variante ${c.name} - ${size}`;
        if (s > 999_999) return `Stock excesivo para variante ${c.name} - ${size} (máximo 999999)`;
      }
    }
    if (Array.isArray(c.images)) {
      if (c.images.length > 10) return "Máximo 10 imágenes por color";
      for (const url of c.images) {
        if (!isValidImageUrl(url)) return "URL de imagen inválida (debe provenir de Cloudinary)";
      }
    }
  }

  // ── Video URL ─────────────────────────────────────────────────────────────
  if (videoUrl && !isHttpUrl(videoUrl))
    return "URL de video inválida (debe ser http/https)";

  // ── Subcategorías ─────────────────────────────────────────────────────────
  if (Array.isArray(items)) {
    if (items.length > 20) return "Demasiadas subcategorías (máximo 20)";
    for (const item of items) {
      if (!item.name || typeof item.name !== "string" || item.name.trim().length < 2)
        return "Nombre de subcategoría inválido (mínimo 2 caracteres)";
      if (item.name.trim().length > 200)
        return "Nombre de subcategoría demasiado largo (máximo 200 caracteres)";
      if (item.price !== undefined && item.price !== null && item.price !== "") {
        const p = Number(item.price);
        if (isNaN(p) || p < 0) return "Precio de subcategoría inválido";
        if (p > 100_000_000) return "Precio de subcategoría parece inusualmente alto";
      }
      if (item.comparePrice !== undefined && item.comparePrice !== null && item.comparePrice !== "") {
        const cp = Number(item.comparePrice);
        if (isNaN(cp) || cp < 0) return "Precio anterior de subcategoría inválido";
        if (cp > 100_000_000) return "Precio anterior de subcategoría parece inusualmente alto";
      }
      if (item.videoUrl && !isHttpUrl(item.videoUrl))
        return "URL de video de subcategoría inválida";
      if (Array.isArray(item.colors)) {
        if (item.colors.length > 30) return "Demasiados colores en subcategoría";
        for (const c of item.colors) {
          if (!c.name || typeof c.name !== "string") return "Nombre de color de subcategoría inválido";
          if (c.name.trim().length > 100) return "Nombre de color de subcategoría demasiado largo";
          if (!HEX_RE.test(c.hexCode ?? "")) return `Código de color inválido en subcategoría: ${c.hexCode}`;
          if (c.variantStocks && typeof c.variantStocks === "object") {
            for (const [size, stockVal] of Object.entries(c.variantStocks)) {
              if (!ALLOWED_SIZES.includes(size as never)) return `Talla inválida en stock de subcategoría: ${size}`;
              const s = Number(stockVal);
              if (isNaN(s) || s < 0) return `Stock inválido para variante ${c.name} - ${size}`;
              if (s > 999_999) return `Stock excesivo para variante ${c.name} - ${size} (máximo 999999)`;
            }
          }
          if (Array.isArray(c.images)) {
            if (c.images.length > 10) return "Máximo 10 imágenes por color de subcategoría";
            for (const url of c.images) {
              if (!isValidImageUrl(url)) return "URL de imagen de subcategoría inválida (debe provenir de Cloudinary)";
            }
          }
        }
      }
    }
  }

  return null;
}

// ── GET: Obtener producto completo por ID ─────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return new NextResponse("Acceso denegado", { status: 403 });
    }
    const { id } = await params;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
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
      videoUrl: product.videoUrl,
      garmentType: product.garmentTypeId ?? null,
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
        comparePrice: item.comparePrice ? Number(item.comparePrice) : null,
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

// ── PATCH: Actualizar Producto completo ───────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return new NextResponse("Acceso denegado", { status: 403 });
    }

    const { id } = await params;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new NextResponse("Cuerpo de solicitud inválido", { status: 400 });
    }

    // ── Toggle rápido de active (desde la tabla) ──────────────────────────────
    if (body.active !== undefined && Object.keys(body).length === 1) {
      if (typeof body.active !== "boolean") {
        return new NextResponse("Valor de estado inválido", { status: 400 });
      }
      const product = await prisma.product.update({
        where: { id },
        data: { status: body.active ? "ACTIVE" : "INACTIVE" },
      });
      return NextResponse.json(product);
    }

    const validationError = validateProductBody(body);
    if (validationError) return new NextResponse(validationError, { status: 400 });

    const {
      name, description, basePrice, comparePrice, stock,
      categoryId, status, isFeatured, isNew,
      isProductNew, isProductNewAt, isOnSale, isOnSaleAt,
      videoUrl, garmentType: garmentTypeId, isSet, colors, sizes, items,
    } = body;

    // ── Verificar que la categoría existe y está activa en DB ─────────────────
    const category = await prisma.category.findUnique({
      where: { id: (categoryId as string).trim() },
      select: { id: true, isActive: true, name: true },
    });
    if (!category) {
      return new NextResponse("La categoría seleccionada no existe", { status: 400 });
    }
    if (!category.isActive) {
      return new NextResponse(`La categoría "${category.name}" está inactiva`, { status: 400 });
    }

    // ── Fechas con parsing seguro ──────────────────────────────────────────────
    const resolvedProductNewAt = isProductNew
      ? (parseSafeDate(isProductNewAt) ?? new Date())
      : null;
    const resolvedOnSaleAt = isOnSale
      ? (parseSafeDate(isOnSaleAt) ?? new Date())
      : null;

    const result = await prisma.$transaction(async (tx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const txDb = tx as any;

      // 1. Liberar reservas de stock activas antes de borrar variantes.
      //    Previene que carritos de clientes queden apuntando a variantes eliminadas.
      await txDb.stockReservation.updateMany({
        where: {
          variant: { productId: id },
          released: false,
          expiresAt: { gt: new Date() },
        },
        data: { released: true },
      });

      // 2. Eliminar imágenes del producto (nivel producto y por color)
      await txDb.productImage.deleteMany({ where: { productId: id } });

      // 3. Eliminar colores — cascade a variants y reservas ya liberadas
      await txDb.productColor.deleteMany({ where: { productId: id } });

      // 4. Eliminar items del conjunto (cascade a colors/images/variants)
      await txDb.productItem.deleteMany({ where: { productId: id } });

      // 5. Actualizar producto — el slug NO se regenera para preservar URLs existentes
      const product = await txDb.product.update({
        where: { id },
        data: {
          name: (name as string).trim(),
          description: description ? (description as string).trim() : "",
          basePrice: basePrice != null ? basePrice : undefined,
          comparePrice: comparePrice != null ? comparePrice : undefined,
          categoryId: (categoryId as string).trim(),
          status,
          isFeatured,
          isNew,
          isProductNew: isProductNew ?? false,
          isProductNewAt: resolvedProductNewAt,
          isOnSale: isOnSale ?? false,
          isOnSaleAt: resolvedOnSaleAt,
          videoUrl: videoUrl !== undefined ? (videoUrl || null) : undefined,
          garmentTypeId: (garmentTypeId as string) || null,
          isSet: isSet ?? false,
          metaTitle: (name as string).trim().slice(0, 60),
          metaDescription: description
            ? (description as string).replace(/\s+/g, " ").trim().slice(0, 160)
            : "",
        },
      });

      const slugForSku = product.slug;

      // 6. Recrear colores/variantes del padre (siempre, independientemente de isSet)
      await createColorVariants(
        txDb, id, slugForSku,
        (colors as any) || [], (sizes as any) || [], (stock as number) ?? 0,
      );

      if (isSet) {
        await createSetItems(txDb, id, slugForSku, (items as any) || []);
      }
      return product;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ── DELETE: Eliminar Producto ─────────────────────────────────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return new NextResponse("Acceso denegado", { status: 403 });
    }

    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const txDb = tx as any;

      // Liberar reservas activas antes de eliminar para evitar errores en carritos
      await txDb.stockReservation.updateMany({
        where: {
          variant: { productId: id },
          released: false,
          expiresAt: { gt: new Date() },
        },
        data: { released: true },
      });

      await txDb.productImage.deleteMany({ where: { productId: id } });
      await txDb.productColor.deleteMany({ where: { productId: id } });
      await txDb.productItem.deleteMany({ where: { productId: id } });
      await txDb.product.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
