import type { ProductCreateInputDTO } from "../contracts/product-create.dto";

const ALLOWED_STATUSES = ["ACTIVE", "INACTIVE"] as const;
const ALLOWED_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "ONESIZE"] as const;
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

function isHttpUrl(v: unknown): boolean {
  if (typeof v !== "string" || !v) return false;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

function isValidImageUrl(v: unknown): boolean {
  if (typeof v !== "string" || !v.trim()) return false;
  try {
    const u = new URL(v);
    return u.protocol === "https:" && u.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

export function parseSafeDate(v: unknown): Date | null {
  if (!v || typeof v !== "string") return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export function parseGarmentTypeIds(body: Record<string, unknown>): string[] {
  const raw = Array.isArray(body.garmentTypes)
    ? body.garmentTypes
    : body.garmentType
      ? [body.garmentType]
      : [];

  const normalized = raw
    .filter((id): id is string => typeof id === "string")
    .map((id) => id.trim())
    .filter(Boolean);

  return [...new Set(normalized)];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateProductCreateBody(body: any): string | null {
  const {
    name, categoryId, description, basePrice, comparePrice,
    stock, status, sizes, colors, items, videoUrl, isSet, garmentTypes,
  } = body as ProductCreateInputDTO;

  if (!name || typeof name !== "string" || name.trim().length < 3)
    return "El nombre debe tener al menos 3 caracteres";
  if (name.trim().length > 200)
    return "El nombre no puede superar 200 caracteres";

  if (!categoryId || typeof categoryId !== "string" || !categoryId.trim())
    return "La categoría es requerida";
  if (categoryId.trim().length > 50)
    return "ID de categoría inválido";

  if (!isSet) {
    if (!description || typeof description !== "string" || description.trim().length < 10)
      return "La descripción debe tener al menos 10 caracteres";
    if (description.trim().length > 5000)
      return "La descripción no puede superar 5000 caracteres";
  }

  if (!isSet) {
    const price = Number(basePrice);
    if (isNaN(price) || price <= 0) return "El precio debe ser mayor a 0";
    if (price > 100_000_000) return "El precio parece inusualmente alto";
  }

  if (comparePrice !== undefined && comparePrice !== null) {
    const cp = Number(comparePrice);
    if (isNaN(cp) || cp < 0) return "El precio de comparación no es válido";
  }

  const globalStock = Number(stock ?? 0);
  if (!isNaN(globalStock) && globalStock > 9_999_999)
    return "El stock total parece inusualmente alto";

  if (status && !ALLOWED_STATUSES.includes(status as never))
    return `Estado inválido: ${status}`;

  if (garmentTypes !== undefined && !Array.isArray(garmentTypes))
    return "Los tipos de prenda deben enviarse como lista";
  if (Array.isArray(garmentTypes) && garmentTypes.length > 20)
    return "Demasiados tipos de prenda (máximo 20)";

  if (Array.isArray(sizes)) {
    if (sizes.length > 20) return "Demasiadas tallas (máximo 20)";
    const invalid = sizes.filter((s: unknown) => !ALLOWED_SIZES.includes(s as never));
    if (invalid.length) return `Tallas inválidas: ${invalid.join(", ")}`;
  }

  if (!isSet) {
    if (!Array.isArray(colors) || colors.length === 0)
      return "Debes seleccionar al menos 1 color para el producto";
    if (!Array.isArray(sizes) || sizes.length === 0)
      return "Debes seleccionar al menos 1 talla para el producto";
  }

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

  if (videoUrl && !isHttpUrl(videoUrl))
    return "URL de video inválida (debe ser http/https)";

  if (Array.isArray(items)) {
    if (items.length > 20) return "Demasiadas subcategorías (máximo 20)";
    for (const item of items) {
      if (!item.name || typeof item.name !== "string" || item.name.trim().length < 2)
        return "Nombre de subcategoría inválido (mínimo 2 caracteres)";
      if (item.name.trim().length > 200)
        return "Nombre de subcategoría demasiado largo (máximo 200 caracteres)";
      if (item.price !== undefined && item.price !== null) {
        const p = Number(item.price);
        if (isNaN(p) || p < 0) return "Precio de subcategoría inválido";
        if (p > 100_000_000) return "Precio de subcategoría parece inusualmente alto";
      }
      if (item.comparePrice !== undefined && item.comparePrice !== null) {
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
