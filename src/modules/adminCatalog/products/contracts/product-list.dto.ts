export type ProductListQueryDTO = {
  page: number;
  limit: number;
};

export type AdminProductListItemDTO = {
  id: string;
  name: string;
  description: string;
  categories: Array<{ id: string; name: string }>;
  images: Array<{ url: string }>;
  videoUrl: string | null;
  price: number;
  stock: number;
  active: boolean;
  isSet: boolean;
  setItems?:
    | Array<{
        name: string;
        price: number | null;
        stock: number;
      }>
    | undefined;
};

export type ProductListPaginationDTO = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type AdminProductListResponseDTO = {
  data: AdminProductListItemDTO[];
  pagination: ProductListPaginationDTO;
};
