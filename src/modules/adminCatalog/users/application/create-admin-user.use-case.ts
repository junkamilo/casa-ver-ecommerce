import { hash } from "bcryptjs";
import { passwordSchema } from "@/lib/auth/validation";
import { PrismaUserAdminRepository } from "../infrastructure/prisma-user-admin.repository";
import { UserAdminConflictError, UserAdminValidationError } from "./user-admin.errors";

const userAdminRepository = new PrismaUserAdminRepository();

export async function createAdminUserUseCase(input: { name?: string; email?: string; password?: string }) {
  if (!input.email) {
    throw new UserAdminValidationError("El email es obligatorio");
  }

  const existing = await userAdminRepository.findUserByEmail(input.email);
  if (existing) {
    if (existing.role !== "ADMIN") {
      const promoted = await userAdminRepository.promoteUserToAdmin(input.email);
      return { ...promoted, promoted: true };
    }
    throw new UserAdminConflictError("Este usuario ya es administrador");
  }

  if (!input.name || !input.password) {
    throw new UserAdminValidationError("Nombre y contraseña son obligatorios para usuarios nuevos");
  }

  const parsed = passwordSchema.safeParse(input.password);
  if (!parsed.success) {
    throw new UserAdminValidationError(parsed.error.issues[0].message);
  }

  const hashedPassword = await hash(input.password, 12);
  return userAdminRepository.createAdmin({
    name: input.name,
    email: input.email,
    hashedPassword,
  });
}
