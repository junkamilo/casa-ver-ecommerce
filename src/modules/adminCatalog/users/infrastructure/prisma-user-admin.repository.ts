import { prisma } from "@/lib/prisma";

export class PrismaUserAdminRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.db = prisma as any;
  }

  async findUserByEmail(email: string) {
    return this.db.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true, image: true },
    });
  }

  async listAdmins() {
    return this.db.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, name: true, email: true, createdAt: true, image: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async promoteUserToAdmin(email: string) {
    return this.db.user.update({
      where: { email },
      data: { role: "ADMIN" },
      select: { id: true, name: true, email: true, createdAt: true },
    });
  }

  async createAdmin(input: { name: string; email: string; hashedPassword: string }) {
    return this.db.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: input.hashedPassword,
        role: "ADMIN",
      },
      select: { id: true, name: true, email: true, createdAt: true },
    });
  }

  async countAdmins(): Promise<number> {
    return this.db.user.count({ where: { role: "ADMIN" } });
  }

  async revokeAdmin(userId: string) {
    return this.db.user.update({
      where: { id: userId },
      data: { role: "USER" },
    });
  }
}
