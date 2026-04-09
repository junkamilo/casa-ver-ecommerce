import { ProductStatus } from "@prisma/client";

export const BEST_SELLERS_WHERE = {
  isFeatured: true as const,
  status: ProductStatus.ACTIVE,
};

export const EMPTY_STATE_MESSAGE = "Pronto agregaremos los productos más vendidos.";
