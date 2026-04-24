export interface AdminProfileDTO {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
}

export interface UpdateAdminProfileInputDTO {
  name?: string;
  phone?: string | null;
  cedula?: string | null;
  recoveryEmail?: string | null;
  currentPassword?: string;
  newPassword?: string;
}
