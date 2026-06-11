import type { GarmentTypeListItemDTO } from "../contracts/garment-type.dto";

export type GarmentTypeUiModel = GarmentTypeListItemDTO;

export function mapGarmentTypeDtoToUi(dto: GarmentTypeListItemDTO): GarmentTypeUiModel {
  return dto;
}

export function mapGarmentTypeListDtoToUi(dtos: GarmentTypeListItemDTO[]): GarmentTypeUiModel[] {
  return dtos.map(mapGarmentTypeDtoToUi);
}
