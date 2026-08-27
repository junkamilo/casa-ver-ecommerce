import { NextResponse } from "next/server";
import { deleteNotificationUseCase } from "@/modules/adminCatalog/notifications/application/delete-notification.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  return runAdminRoute(async () => {
    try {
      const { id } = await context.params;
      const result = await deleteNotificationUseCase(id);
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
