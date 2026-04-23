export type ColorListItemDTO = {
  id: string;
  name: string;
  hexCode: string;
  isActive: boolean;
};

export type CreateColorInputDTO = {
  name: string;
  hexCode: string;
};

export type ToggleColorInputDTO = {
  id: string;
  action: "toggle";
};

export type UpdateColorInputDTO = {
  id: string;
  name: string;
  hexCode: string;
};

export type DeleteColorInputDTO = {
  id: string;
};
