import type {
  AdminProductListItemDTO,
  AdminProductListResponseDTO,
  ProductListPaginationDTO,
} from "../contracts/product-list.dto";
import type { ProductCreateInputDTO } from "../contracts/product-create.dto";

type ProductListItem = AdminProductListItemDTO;
type Category = {
  id: string;
  name: string;
  garmentTypes: Array<{ id: string; name: string }>;
};
type PresetColor = { name: string; hex: string };
type SelectedColor = {
  name: string;
  hexCode: string;
  images: string[];
  variantStocks?: { [size: string]: number };
};
type SetItemForm = {
  localId: string;
  name: string;
  description: string;
  price: string;
  comparePrice: string;
  videoUrl: string;
  stock: string;
  colors: SelectedColor[];
  sizes: string[];
};

export type AdminCategoryDTO = {
  id: string;
  name: string;
  garmentTypes?: Array<{ id: string; name: string }>;
};

export type AdminColorDTO = {
  name: string;
  hexCode: string;
};

export type AdminProductDetailDTO = {
  id: string;
  name: string;
  description?: string | null;
  basePrice?: number | null;
  comparePrice?: number | null;
  stock?: number | null;
  categoryId: string;
  status: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isProductNew?: boolean;
  isProductNewAt?: string | null;
  isOnSale?: boolean;
  isOnSaleAt?: string | null;
  videoUrl?: string | null;
  garmentTypes?: string[];
  isSet?: boolean;
  colors?: SelectedColor[];
  sizes?: string[];
  items?: Array<{
    name: string;
    description?: string | null;
    price?: number | null;
    comparePrice?: number | null;
    videoUrl?: string | null;
    stock?: number | null;
    colors?: SelectedColor[];
    sizes?: string[];
  }>;
};

export type ProductFormInitialValues = {
  name: string;
  description: string;
  basePrice: string;
  comparePrice: string;
  stock: string;
  categoryId: string;
  status: string;
  isFeatured: boolean;
  isNew: boolean;
  isProductNew: boolean;
  isProductNewAt: string | null;
  isOnSale: boolean;
  isOnSaleAt: string | null;
  videoUrl: string;
  garmentTypes: string[];
  isSet: boolean;
  selectedColors: SelectedColor[];
  selectedSizes: string[];
  setItems: SetItemForm[];
};

export function mapAdminProductListItemToUi(item: AdminProductListItemDTO): ProductListItem {
  return item;
}

export function mapAdminProductsResponseToUi(response: AdminProductListResponseDTO): {
  data: ProductListItem[];
  pagination: ProductListPaginationDTO;
} {
  return {
    data: response.data.map(mapAdminProductListItemToUi),
    pagination: response.pagination,
  };
}

export function mapAdminCategoriesToUi(categories: AdminCategoryDTO[]): Category[] {
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    garmentTypes: category.garmentTypes ?? [],
  }));
}

export function mapPresetColorsToUi(colors: AdminColorDTO[]): PresetColor[] {
  return colors.map((color) => ({
    name: color.name,
    hex: color.hexCode,
  }));
}

export function mapAdminProductDetailToFormInitialValues(
  product: AdminProductDetailDTO
): ProductFormInitialValues {
  return {
    name: product.name,
    description: product.description || "",
    basePrice: product.basePrice?.toString() || "",
    comparePrice: product.comparePrice?.toString() || "",
    stock: product.stock?.toString() || "",
    categoryId: product.categoryId,
    status: product.status,
    isFeatured: product.isFeatured || false,
    isNew: product.isNew || false,
    isProductNew: product.isProductNew || false,
    isProductNewAt: product.isProductNewAt ? new Date(product.isProductNewAt).toISOString() : null,
    isOnSale: product.isOnSale || false,
    isOnSaleAt: product.isOnSaleAt ? new Date(product.isOnSaleAt).toISOString() : null,
    videoUrl: product.videoUrl || "",
    garmentTypes: product.garmentTypes ?? [],
    isSet: product.isSet || false,
    selectedColors: product.colors || [],
    selectedSizes: product.sizes || [],
    setItems:
      product.isSet && product.items?.length
        ? product.items.map((item) => ({
            localId: crypto.randomUUID(),
            name: item.name || "",
            description: item.description || "",
            price: item.price?.toString() || "",
            comparePrice: item.comparePrice != null ? String(item.comparePrice) : "",
            videoUrl: item.videoUrl || "",
            stock: item.stock?.toString() || "",
            colors: item.colors || [],
            sizes: item.sizes || [],
          }))
        : [],
  };
}

export function mapProductFormToCreatePayload(input: {
  name: string;
  description: string;
  basePrice: string;
  comparePrice: string;
  stock: string;
  categoryId: string;
  status: string;
  isFeatured: boolean;
  isNew: boolean;
  isProductNew: boolean;
  isProductNewAt: string | null;
  isOnSale: boolean;
  isOnSaleAt: string | null;
  videoUrl: string;
  garmentTypes: string[];
  isSet: boolean;
  selectedColors: SelectedColor[];
  selectedSizes: string[];
  setItems: SetItemForm[];
}): ProductCreateInputDTO {
  const calcEffectiveStock = (colors: SelectedColor[], fallbackStock: string): number => {
    const hasVariants = colors.some((color) => Object.keys(color.variantStocks || {}).length > 0);
    if (hasVariants) {
      return colors.reduce(
        (sum, color) =>
          sum + Object.values(color.variantStocks || {}).reduce((colorSum, value) => colorSum + Number(value), 0),
        0
      );
    }
    return fallbackStock ? parseInt(fallbackStock, 10) : 0;
  };

  return {
    name: input.name,
    description: input.description || "",
    basePrice: input.basePrice ? parseFloat(input.basePrice) : 0,
    comparePrice: input.comparePrice ? parseFloat(input.comparePrice) : null,
    stock: calcEffectiveStock(input.selectedColors, input.stock),
    categoryId: input.categoryId,
    status: input.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    isFeatured: input.isFeatured,
    isNew: input.isNew,
    isProductNew: input.isProductNew,
    isProductNewAt: input.isProductNewAt ?? null,
    isOnSale: input.isOnSale,
    isOnSaleAt: input.isOnSaleAt ?? null,
    videoUrl: input.videoUrl || null,
    garmentTypes: input.garmentTypes,
    isSet: input.isSet,
    colors: input.selectedColors,
    sizes: input.selectedSizes,
    items: input.isSet
      ? input.setItems.map((item) => ({
          name: item.name,
          description: item.description || null,
          price: item.price ? parseFloat(item.price) : null,
          comparePrice: item.comparePrice ? parseFloat(item.comparePrice) : null,
          videoUrl: item.videoUrl || null,
          stock: calcEffectiveStock(item.colors, item.stock),
          colors: item.colors,
          sizes: item.sizes,
        }))
      : [],
  };
}
