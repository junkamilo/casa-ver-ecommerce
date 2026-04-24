import { NextResponse } from "next/server";
import {
  getAdminOrdersUseCase,
  updateAdminOrderStatusUseCase,
} from "@/modules/adminCatalog/orders/application/orders.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

export async function GET() {
  return runAdminRoute(async () => {
    try {
      const orders = await getAdminOrdersUseCase();
      return NextResponse.json(orders);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

export async function PATCH(req: Request) {
  return runAdminRoute(async () => {
    try {
      const body = (await req.json()) as { orderNumber?: string; statusEs?: string };
      await updateAdminOrderStatusUseCase(body.orderNumber ?? "", body.statusEs ?? "");
      return NextResponse.json({ ok: true });
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
