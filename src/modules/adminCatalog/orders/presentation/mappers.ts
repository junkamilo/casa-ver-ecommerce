import type { AdminOrderDTO } from "../contracts/order-admin.dto";

export type AdminOrderUiModel = AdminOrderDTO;

export function mapAdminOrderDtoToUi(dto: AdminOrderDTO): AdminOrderUiModel {
  return dto;
}

export function mapAdminOrderListDtoToUi(dtos: AdminOrderDTO[]): AdminOrderUiModel[] {
  return dtos.map(mapAdminOrderDtoToUi);
}
