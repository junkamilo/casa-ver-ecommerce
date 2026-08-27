import { prisma } from "@/lib/prisma";
import type { NotificationsListResponseDTO } from "../contracts/notification.dto";

export class PrismaNotificationRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.db = prisma as any;
  }

  async getLatestNotificationsWithUnreadCount(): Promise<NotificationsListResponseDTO> {
    const [unreadCount, notifications] = await Promise.all([
      this.db.adminNotification.count({ where: { isRead: false } }),
      this.db.adminNotification.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          orderId: true,
          title: true,
          body: true,
          isRead: true,
          createdAt: true,
        },
      }),
    ]);

    return { unreadCount, notifications };
  }

  async markAllAsRead() {
    await this.db.adminNotification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
  }

  async deleteById(id: string): Promise<boolean> {
    const existing = await this.db.adminNotification.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) return false;
    await this.db.adminNotification.delete({ where: { id } });
    return true;
  }

  async deleteAll(): Promise<number> {
    const result = await this.db.adminNotification.deleteMany({});
    return result.count as number;
  }
}
