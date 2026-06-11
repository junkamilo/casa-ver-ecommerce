import type { AdminLookupResponseDTO, AdminUserDTO } from "../contracts/user-admin.dto";

export type AdminUiModel = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  image: string | null;
};

export type LookupResultUiModel = {
  exists: boolean;
  isAdmin?: boolean;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

export function mapAdminUserDtoToUi(dto: AdminUserDTO): AdminUiModel {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email ?? "",
    createdAt: dto.createdAt instanceof Date ? dto.createdAt.toISOString() : String(dto.createdAt),
    image: dto.image ?? null,
  };
}

export function mapAdminUserListDtoToUi(dtos: AdminUserDTO[]): AdminUiModel[] {
  return dtos.map(mapAdminUserDtoToUi);
}

export function mapLookupDtoToUi(dto: AdminLookupResponseDTO): LookupResultUiModel {
  if (!dto.exists) {
    return { exists: false };
  }

  return {
    exists: true,
    isAdmin: dto.isAdmin,
    user: {
      id: dto.user.id,
      name: dto.user.name,
      email: dto.user.email ?? "",
      image: dto.user.image ?? null,
    },
  };
}
