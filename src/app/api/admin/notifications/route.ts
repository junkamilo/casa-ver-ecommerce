import { NextResponse } from "next/server";
import { listNotificationsUseCase } from "@/modules/adminCatalog/notifications/application/list-notifications.use-case";
import { deleteAllNotificationsUseCase } from "@/modules/adminCatalog/notifications/application/delete-notification.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

// GET — devuelve unreadCount + últimas 20 notificaciones
export async function GET() {
  return runAdminRoute(async () => {
    try {
      const result = await listNotificationsUseCase();
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

// DELETE — borra todas las notificaciones (no toca pedidos)
export async function DELETE() {
  return runAdminRoute(async () => {
    try {
      const result = await deleteAllNotificationsUseCase();
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
