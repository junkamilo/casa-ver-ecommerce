import { PrismaUserAdminRepository } from "../infrastructure/prisma-user-admin.repository";
import { UserAdminValidationError } from "./user-admin.errors";

const userAdminRepository = new PrismaUserAdminRepository();

export async function revokeAdminUserUseCase(input: { userId?: string | null; currentUserId?: string | null }) {
  if (!input.userId) {
    throw new UserAdminValidationError("ID de usuario requerido");
  }
  if (input.currentUserId === input.userId) {
    throw new UserAdminValidationError("No puedes revocar tu propio acceso de administrador");
  }

  const adminCount = await userAdminRepository.countAdmins();
  if (adminCount <= 1) {
    throw new UserAdminValidationError("Debe haber al menos un administrador");
  }

  await userAdminRepository.revokeAdmin(input.userId);
  return { message: "Admin revocado exitosamente" };
}
