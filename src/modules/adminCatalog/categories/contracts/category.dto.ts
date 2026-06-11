export type GarmentTypeDTO = {
  id: string;
  name: string;
};

export type CategoryListItemDTO = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  isActive: boolean;
  order: number;
  _count: {
    products: number;
  };
  garmentTypes: GarmentTypeDTO[];
};

export type CreateCategoryInputDTO = {
  name: string;
  image?: string | null;
  garmentTypeIds: string[];
};

export type ToggleCategoryInputDTO = {
  id: string;
  action: "toggle";
};

export type UpdateCategoryInputDTO = {
  id: string;
  name: string;
  image?: string | null;
  garmentTypeIds: string[];
};

export type DeleteCategoryInputDTO = {
  id: string;
};
