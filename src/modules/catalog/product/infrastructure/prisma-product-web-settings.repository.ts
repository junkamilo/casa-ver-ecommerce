import { prisma } from "@/lib/prisma";

// Capa web de los productos del POS (`product_web_settings`, por slug): SEO, portada/video propios, oferta
// manual, "Nueva colección" y la fecha de alta que ordena los listados. Es lo único del catálogo del POS
// que la web guarda; el resto se lee de la API del POS.

export interface ProductWebSettingsRow {
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
  coverImageUrl: string | null;
  videoUrl: string | null;
  isNew: boolean;
  isOnSale: boolean;
  isOnSaleAt: Date | null;
  publishedAt: Date;
}

export type ProductWebSettingsInput = Partial<
  Pick<
    ProductWebSettingsRow,
    "metaTitle" | "metaDescription" | "coverImageUrl" | "videoUrl" | "isNew" | "isOnSale" | "isOnSaleAt"
  >
>;

const SELECT = {
  slug: true,
  metaTitle: true,
  metaDescription: true,
  coverImageUrl: true,
  videoUrl: true,
  isNew: true,
  isOnSale: true,
  isOnSaleAt: true,
  publishedAt: true,
} as const;

export class PrismaProductWebSettingsRepository {
  async findBySlug(slug: string): Promise<ProductWebSettingsRow | null> {
    return prisma.productWebSettings.findUnique({ where: { slug }, select: SELECT });
  }

  async findAll(): Promise<Map<string, ProductWebSettingsRow>> {
    const rows = await prisma.productWebSettings.findMany({ select: SELECT });
    return new Map(rows.map((row) => [row.slug, row]));
  }

  /** Registra el alta de un producto del POS la primera vez que la web lo ve (no toca lo ya guardado). */
  async ensure(slug: string): Promise<void> {
    await prisma.productWebSettings.upsert({ where: { slug }, create: { slug }, update: {} });
  }

  /** Guarda lo que el admin decide sobre un producto del POS (`undefined` = no se cambia). */
  async save(slug: string, data: ProductWebSettingsInput): Promise<void> {
    await prisma.productWebSettings.upsert({ where: { slug }, create: { slug, ...data }, update: data });
  }
}
