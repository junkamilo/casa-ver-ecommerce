// Thin re-exports desde `modules/catalog/product/domain/product-detail.entity`.
// `mapRecommended` se eliminó: el use case `getProductDetailUseCase` ahora usa
// el `transformProduct` unificado del módulo `collections` para los productos
// recomendados (consolidación del 5to mapper duplicado).
export {
  mapUIColor,
  mapUIItems,
  computeTotalStock,
  mapUIProduct,
  mapProductReviews,
  mapSocialProof,
} from "@/modules/catalog/product/domain/product-detail.entity";
