import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCouponUsageUseCase } from "@/modules/adminCatalog/coupons/application/get-coupon-usage.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

export async function GET(req: NextRequest) {
  return runAdminRoute(async () => {
    try {
      const id = new URL(req.url).searchParams.get("id");
      const result = await getCouponUsageUseCase({ id });
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
