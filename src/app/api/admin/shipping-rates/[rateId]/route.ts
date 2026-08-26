import { NextResponse } from "next/server";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";
import { updateShippingRateUseCase } from "@/modules/shipping/application/use-cases/update-shipping-rate.use-case";
import { deleteShippingRateUseCase } from "@/modules/shipping/application/use-cases/delete-shipping-rate.use-case";
import { UpdateShippingRateSchema } from "@/modules/shipping/contracts/shipping.dto";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ rateId: string }> }
) {
  return runAdminRoute(async () => {
    try {
      const p = await params;
      const body = await request.json();
      const parsed = UpdateShippingRateSchema.parse(body);
      const data = await updateShippingRateUseCase(p.rateId, parsed);
      return NextResponse.json(data);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ rateId: string }> }
) {
  return runAdminRoute(async () => {
    try {
      const p = await params;
      const data = await deleteShippingRateUseCase(p.rateId);
      return NextResponse.json(data);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
