import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { createColorVariants, createSetItems } from "./_helpers";

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
function validateProductBody(body: any, isCreate: boolean): string | null {
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
    if (isCreate && price > 100_000_000) return "El precio parece inusualmente alto";
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

// ── GET: Listar Productos (resumen para tabla) ────────────────────────────────

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return new NextResponse("Acceso denegado", { status: 403 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products: any[] = await db.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        images: { where: { colorId: null }, orderBy: [{ isCover: "desc" }, { order: "asc" }], take: 1, select: { url: true } },
        colors: { take: 1, include: { images: { orderBy: [{ isCover: "desc" }, { order: "asc" }], take: 1, select: { url: true } } } },
        variants: { select: { stock: true } },
        items: {
          orderBy: { order: "asc" as const },
          select: {
            name: true,
            price: true,
            colors: {
              select: {
                images: { orderBy: [{ isCover: "desc" }, { order: "asc" }], take: 1, select: { url: true } },
                variants: { select: { stock: true } },
              },
            },
          },
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped = products.map((p: any) => {
      const generalImg = p.images[0]?.url;
      const colorImg = p.colors[0]?.images[0]?.url;
      const setItemImg = p.items?.[0]?.colors?.[0]?.images?.[0]?.url;
      const regularStock = p.variants.reduce((sum: number, v: any) => sum + v.stock, 0);

      const setItems = (p.isSet && p.items?.length)
        ? p.items.map((item: any) => ({
            name: item.name,
            price: item.price != null ? Number(item.price) : null,
            stock: (item.colors ?? []).reduce(
              (sum: number, c: any) =>
                sum + (c.variants ?? []).reduce((s: number, v: any) => s + v.stock, 0),
              0,
            ),
          }))
        : undefined;

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
        videoUrl: p.videoUrl ?? null,
        price: Number(p.basePrice),
        stock: regularStock,
        active: p.status === "ACTIVE",
        isSet: p.isSet ?? false,
        setItems,
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ── POST: Crear Producto completo ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return new NextResponse("Acceso denegado", { status: 403 });
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new NextResponse("Cuerpo de solicitud inválido", { status: 400 });
    }

    const validationError = validateProductBody(body, true);
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

    const slug =
      (name as string).toLowerCase().trim().replace(/[\s\W-]+/g, "-").replace(/^-+|-+$/g, "") +
      "-" + Date.now();

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

      const product = await txDb.product.create({
        data: {
          name: (name as string).trim(),
          slug,
          description: description ? (description as string).trim() : "",
          basePrice,
          comparePrice: comparePrice || null,
          categoryId: (categoryId as string).trim(),
          status: status || "ACTIVE",
          isFeatured: isFeatured || false,
          isNew: isNew || false,
          isProductNew: isProductNew || false,
          isProductNewAt: resolvedProductNewAt,
          isOnSale: isOnSale || false,
          isOnSaleAt: resolvedOnSaleAt,
          videoUrl: videoUrl || null,
          garmentTypeId: (garmentTypeId as string) || null,
          isSet: isSet || false,
          metaTitle: (name as string).trim().slice(0, 60),
          metaDescription: description
            ? (description as string).replace(/\s+/g, " ").trim().slice(0, 160)
            : "",
        },
      });

      // Colores del padre — siempre se crean, independientemente de isSet
      await createColorVariants(
        txDb, product.id, slug,
        (colors as any) || [], (sizes as any) || [], (stock as number) ?? 0,
      );

      if (isSet) {
        await createSetItems(txDb, product.id, slug, (items as any) || []);
      }
      return product;
    });

    revalidatePath("/");
    return NextResponse.json(result);
  } catch (error) {
    console.error("[PRODUCTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
