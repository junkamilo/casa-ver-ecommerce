// ─────────────────────────────────────────────────────────────────────────────
// Thin re-export del mapper unificado del dominio.
//
// La implementación vive ahora en `src/modules/collections/domain/product-mapper.entity.ts`.
// Mantenemos los aliases originales (`mapRawToCollectionProduct`, `RawNewProduct`)
// para no romper consumidores externos en caso de existir.
// ─────────────────────────────────────────────────────────────────────────────

export { transformProduct as mapRawToCollectionProduct } from "@/modules/collections/domain/product-mapper.entity";
export type { RawCollectionProduct as RawNewProduct } from "@/modules/collections/domain/product-mapper.entity";
