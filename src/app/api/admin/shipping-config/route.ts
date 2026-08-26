import { NextResponse } from "next/server";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";
import { updateShippingConfigUseCase } from "@/modules/shipping/application/use-cases/update-shipping-config.use-case";
import { getShippingConfigFromDb } from "@/modules/shipping/infrastructure/prisma-shipping-config.repository";
import { UpdateShippingConfigSchema } from "@/modules/shipping/contracts/shipping.dto";

export async function GET() {
  return runAdminRoute(async () => {
    try {
      const config = await getShippingConfigFromDb();
      return NextResponse.json({
        freeShippingThreshold: config?.freeShippingThreshold ?? 0,
        defaultRateId: config?.defaultRateId ?? null,
      });
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

export async function PUT(request: Request) {
  return runAdminRoute(async () => {
    try {
      const body = await request.json();
      const parsed = UpdateShippingConfigSchema.parse(body);

      const updated = await updateShippingConfigUseCase(parsed);
      return NextResponse.json(updated);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
