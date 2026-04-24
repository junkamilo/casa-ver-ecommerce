export type AdminNotificationDTO = {
  id: string;
  orderId: string | null;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
};

export type NotificationsListResponseDTO = {
  unreadCount: number;
  notifications: AdminNotificationDTO[];
};
