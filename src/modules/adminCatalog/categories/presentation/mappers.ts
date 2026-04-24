import type { CategoryListItemDTO } from "../contracts/category.dto";

export type CategoryUiModel = Omit<CategoryListItemDTO, "image"> & {
  image?: string;
};

export function mapCategoryDtoToUi(dto: CategoryListItemDTO): CategoryUiModel {
  return {
    ...dto,
    image: dto.image ?? undefined,
  };
}

export function mapCategoryDtoListToUi(dtos: CategoryListItemDTO[]): CategoryUiModel[] {
  return dtos.map(mapCategoryDtoToUi);
}
