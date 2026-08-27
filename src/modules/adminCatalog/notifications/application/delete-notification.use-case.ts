import { PrismaNotificationRepository } from "../infrastructure/prisma-notification.repository";
import { NotificationNotFoundError } from "./notification.errors";

const notificationRepository = new PrismaNotificationRepository();

export async function deleteNotificationUseCase(id: string) {
  const deleted = await notificationRepository.deleteById(id);
  if (!deleted) throw new NotificationNotFoundError();
  return { ok: true as const };
}

export async function deleteAllNotificationsUseCase() {
  const deleted = await notificationRepository.deleteAll();
  return { ok: true as const, deleted };
}
