import { PrismaNotificationRepository } from "../infrastructure/prisma-notification.repository";

const notificationRepository = new PrismaNotificationRepository();

export async function markNotificationsReadUseCase() {
  await notificationRepository.markAllAsRead();
  return { ok: true };
}
