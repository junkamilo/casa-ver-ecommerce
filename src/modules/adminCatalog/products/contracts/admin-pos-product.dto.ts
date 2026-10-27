// Admin de productos de la web (md/COMPARACION-TABLAS-INVENTARIO-Y-PRODUCTOS-POS-vs-WEB.md): los productos,
// variantes, precios, fotos e inventario se administran en el POS. La web lista lo que el POS publica y solo
// guarda su capa propia por slug (`product_web_settings`).

export type AdminPosVariantDTO = {
  colorName: string;
  size: string;
  available: boolean;
  lowStock: boolean;
};

export type AdminPosColorDTO = {
  name: string;
  hexCode: string;
  images: string[];
};

/** Lo que la web decide sobre un producto del POS. */
export type AdminWebSettingsDTO = {
  isNew: boolean;
  isOnSale: boolean;
  isOnSaleAt: string | null;
  coverImageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
};

export type AdminPosProductDTO = {
  slug: string;
  name: string;
  salePrice: number;
  displayPrice: number | null;
  /** Portada que muestra la tienda (la elegida en la web si sigue siendo válida, si no la del POS). */
  coverImageUrl: string | null;
  categoryNames: string[];
  available: boolean;
  /** Variantes en su mínimo de alerta o agotadas. */
  lowStockCount: number;
  outOfStockCount: number;
  /** Etiquetas del POS (solo lectura en la web). */
  labels: { bestSeller: boolean; productNew: boolean; suggested: boolean; onSale: boolean };
  /** Piezas si es un conjunto. */
  components: string[];
  colors: AdminPosColorDTO[];
  variants: AdminPosVariantDTO[];
  web: AdminWebSettingsDTO;
  publishedAt: string;
};

export type AdminPosProductListDTO = {
  products: AdminPosProductDTO[];
  categories: string[];
};
