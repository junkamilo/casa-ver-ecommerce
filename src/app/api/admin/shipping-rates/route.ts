import { NextResponse } from "next/server";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";
import { listShippingRatesUseCase } from "@/modules/shipping/application/use-cases/list-shipping-rates.use-case";
import { createShippingRateUseCase } from "@/modules/shipping/application/use-cases/create-shipping-rate.use-case";
import { CreateShippingRateSchema } from "@/modules/shipping/contracts/shipping.dto";

export async function GET() {
  return runAdminRoute(async () => {
    try {
      const data = await listShippingRatesUseCase();
      return NextResponse.json(data);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

export async function POST(request: Request) {
  return runAdminRoute(async () => {
    try {
      const body = await request.json();
      const parsed = CreateShippingRateSchema.parse(body);
      const data = await createShippingRateUseCase(parsed);
      return NextResponse.json(data);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
