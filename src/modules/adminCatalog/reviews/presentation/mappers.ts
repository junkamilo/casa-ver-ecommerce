import type { AdminReviewDTO } from "../contracts/review.dto";

export type AdminReviewUiModel = AdminReviewDTO;

export function mapAdminReviewDtoToUi(dto: AdminReviewDTO): AdminReviewUiModel {
  return dto;
}

export function mapAdminReviewListDtoToUi(dtos: AdminReviewDTO[]): AdminReviewUiModel[] {
  return dtos.map(mapAdminReviewDtoToUi);
}
