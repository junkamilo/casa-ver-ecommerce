import { PrismaUserAdminRepository } from "../infrastructure/prisma-user-admin.repository";

const userAdminRepository = new PrismaUserAdminRepository();

export async function getAdminUsersUseCase(input: { lookupEmail?: string | null }) {
  if (input.lookupEmail) {
    const user = await userAdminRepository.findUserByEmail(input.lookupEmail);
    if (!user) return { exists: false as const };
    return {
      exists: true as const,
      isAdmin: user.role === "ADMIN",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    };
  }

  return userAdminRepository.listAdmins();
}
