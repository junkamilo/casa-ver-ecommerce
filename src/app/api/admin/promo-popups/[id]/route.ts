import { NextResponse } from "next/server";
import { deletePromoPopupUseCase } from "@/modules/adminCatalog/promoPopups/application/delete-promo-popup.use-case";
import { togglePromoPopupActiveUseCase } from "@/modules/adminCatalog/promoPopups/application/toggle-promo-popup-active.use-case";
import { updatePromoPopupUseCase } from "@/modules/adminCatalog/promoPopups/application/update-promo-popup.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, context: RouteContext) {
  return runAdminRoute(async () => {
    try {
      const { id } = await context.params;
      const body = await req.json();

      if (body && typeof body === "object" && "isActive" in body && Object.keys(body).length === 1) {
        const result = await togglePromoPopupActiveUseCase({ id, isActive: Boolean(body.isActive) });
        return NextResponse.json(result);
      }

      const result = await updatePromoPopupUseCase({ ...body, id });
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

export async function DELETE(_req: Request, context: RouteContext) {
  return runAdminRoute(async () => {
    try {
      const { id } = await context.params;
      const result = await deletePromoPopupUseCase({ id });
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
