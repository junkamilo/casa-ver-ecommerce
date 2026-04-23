export type UpdateProductVariantStockInputDTO = {
  productId: string;
  variantId: string;
  stock: number;
};

export type ProductVariantStockDTO = {
  id: string;
  colorName: string;
  size: string;
  stock: number;
  minStock: number;
  sku: string;
  updatedAt: Date;
};
