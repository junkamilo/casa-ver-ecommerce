import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateCouponsUseCase } from "@/modules/adminCatalog/coupons/application/generate-coupons.use-case";
import { listCouponsUseCase } from "@/modules/adminCatalog/coupons/application/list-coupons.use-case";
import { deleteCouponUseCase } from "@/modules/adminCatalog/coupons/application/delete-coupon.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

export async function GET(req: NextRequest) {
  return runAdminRoute(async () => {
    try {
      const params = Object.fromEntries(new URL(req.url).searchParams.entries());
      const result = await listCouponsUseCase(params);
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

export async function POST(req: NextRequest) {
  return runAdminRoute(async (admin) => {
    try {
      const body = await req.json();
      const result = await generateCouponsUseCase(body, admin.userId);
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

export async function DELETE(req: NextRequest) {
  return runAdminRoute(async () => {
    try {
      const id = new URL(req.url).searchParams.get("id");
      const result = await deleteCouponUseCase({ id });
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
