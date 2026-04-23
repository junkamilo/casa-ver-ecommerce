import { prisma } from "@/lib/prisma";

export class PrismaAccountRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.db = prisma as any;
  }

  async getAccountsWithUsersForDebug() {
    return this.db.account.findMany({
      select: {
        id: true,
        provider: true,
        type: true,
        expires_at: true,
        scope: true,
        // Los tokens reales nunca se piden aquí
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            emailVerified: true,
            createdAt: true,
          },
        },
      },
      orderBy: { user: { email: "asc" } },
    });
  }

  async getTotalUsersCount(): Promise<number> {
    return this.db.user.count();
  }
}