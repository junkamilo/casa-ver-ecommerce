import type { ColorListItemDTO } from "../contracts/color.dto";

export type AdminColorUiModel = ColorListItemDTO;

export function mapColorDtoToUi(dto: ColorListItemDTO): AdminColorUiModel {
  return dto;
}

export function mapColorListDtoToUi(dtos: ColorListItemDTO[]): AdminColorUiModel[] {
  return dtos.map(mapColorDtoToUi);
}
