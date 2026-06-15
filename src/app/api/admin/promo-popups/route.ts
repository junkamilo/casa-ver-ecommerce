import { NextResponse } from "next/server";
import { createPromoPopupUseCase } from "@/modules/adminCatalog/promoPopups/application/create-promo-popup.use-case";
import { listPromoPopupsUseCase } from "@/modules/adminCatalog/promoPopups/application/list-promo-popups.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

export async function GET() {
  return runAdminRoute(async () => {
    try {
      const result = await listPromoPopupsUseCase();
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

export async function POST(req: Request) {
  return runAdminRoute(async () => {
    try {
      const body = await req.json();
      const result = await createPromoPopupUseCase(body);
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
