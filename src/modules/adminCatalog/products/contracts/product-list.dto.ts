export type ProductListQueryDTO = {
  page: number;
  limit: number;
};

export type AdminProductListItemDTO = {
  id: string;
  name: string;
  description: string;
  /** Categorías del POS donde está (por nombre); vacío en productos creados en la web. */
  categories: Array<{ id: string; name: string }>;
  posSlug: string | null;
  images: Array<{ url: string }>;
  videoUrl: string | null;
  price: number;
  stock: number;
  active: boolean;
  isSet: boolean;
  /** Sincronizado desde el POS: solo se editan los campos propios de la web. */
  posManaged: boolean;
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
  /** El catálogo lo administra el POS: la web no crea productos nuevos. */
  posCatalogEnabled?: boolean;
};
