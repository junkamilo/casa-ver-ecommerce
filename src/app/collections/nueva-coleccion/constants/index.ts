import { ProductStatus } from "@prisma/client";

export const NEW_COLLECTION_WHERE = {
  isNew: true as const,
  status: ProductStatus.ACTIVE,
};

export const EMPTY_STATE_MESSAGE = "Pronto agregaremos nuevos ingresos.";
