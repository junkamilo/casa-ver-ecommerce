import type { AdminProfileDTO } from "../contracts/profile.dto";

export type AdminProfileUiModel = AdminProfileDTO;

export function mapAdminProfileDtoToUi(dto: AdminProfileDTO): AdminProfileUiModel {
  return dto;
}
