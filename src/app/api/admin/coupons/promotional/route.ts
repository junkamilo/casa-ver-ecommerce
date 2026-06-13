import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createPromotionalCouponUseCase } from "@/modules/adminCatalog/coupons/application/create-promotional-coupon.use-case";
import { listPromotionalCouponsUseCase } from "@/modules/adminCatalog/coupons/application/list-promotional-coupons.use-case";
import { deactivatePromotionalCouponUseCase } from "@/modules/adminCatalog/coupons/application/deactivate-promotional-coupon.use-case";
import { deletePromotionalCouponUseCase } from "@/modules/adminCatalog/coupons/application/delete-promotional-coupon.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

export async function GET(req: NextRequest) {
  return runAdminRoute(async () => {
    try {
      const params = Object.fromEntries(new URL(req.url).searchParams.entries());
      const result = await listPromotionalCouponsUseCase(params);
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

export async function POST(req: NextRequest) {
  return runAdminRoute(async () => {
    try {
      const body = await req.json();
      const result = await createPromotionalCouponUseCase(body);
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

export async function PATCH(req: NextRequest) {
  return runAdminRoute(async () => {
    try {
      const id = new URL(req.url).searchParams.get("id");
      const result = await deactivatePromotionalCouponUseCase({ id });
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

export async function DELETE(req: NextRequest) {
  return runAdminRoute(async () => {
    try {
      const id = new URL(req.url).searchParams.get("id");
      const result = await deletePromotionalCouponUseCase({ id });
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
