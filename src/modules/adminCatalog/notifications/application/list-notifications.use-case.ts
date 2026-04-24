import { PrismaNotificationRepository } from "../infrastructure/prisma-notification.repository";

const notificationRepository = new PrismaNotificationRepository();

export async function listNotificationsUseCase() {
  return notificationRepository.getLatestNotificationsWithUnreadCount();
}
