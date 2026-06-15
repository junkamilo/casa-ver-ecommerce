import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getActivePromoPopupUseCase } from "@/modules/adminCatalog/promoPopups/application/get-active-promo-popup.use-case";
import { toErrorResponse } from "@/server/http/error-response";

export const revalidate = 60;

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(new URL(req.url).searchParams.entries());
    const data = await getActivePromoPopupUseCase(params);

    return NextResponse.json(
      { data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
