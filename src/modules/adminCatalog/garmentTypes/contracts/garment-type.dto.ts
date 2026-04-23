export type GarmentTypeListItemDTO = {
  id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  _count: {
    products: number;
    categories: number;
  };
};

export type CreateGarmentTypeInputDTO = {
  name: string;
};

export type ToggleGarmentTypeInputDTO = {
  id: string;
  action: "toggle";
};

export type UpdateGarmentTypeInputDTO = {
  id: string;
  name: string;
};

export type DeleteGarmentTypeInputDTO = {
  id: string;
};
