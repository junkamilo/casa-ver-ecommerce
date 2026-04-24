import { NextResponse } from "next/server";
import { markNotificationsReadUseCase } from "@/modules/adminCatalog/notifications/application/mark-notifications-read.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

// POST — marca todas las notificaciones no leídas como leídas
export async function POST() {
  return runAdminRoute(async () => {
    try {
      const result = await markNotificationsReadUseCase();
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
