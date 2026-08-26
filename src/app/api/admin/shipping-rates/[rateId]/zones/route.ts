import { NextResponse } from "next/server";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";
import { prisma } from "@/lib/prisma";
import { getShippingConfigFromDb } from "@/modules/shipping/infrastructure/prisma-shipping-config.repository";
import { ShippingDefaultRateZoneAssignmentValidationError } from "@/modules/shipping/application/errors";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ rateId: string }> }
) {
  return runAdminRoute(async () => {
    try {
      const { rateId } = await params;
      const body = await request.json();

      const { municipalityIds } = body as { municipalityIds: string[] };

      const config = await getShippingConfigFromDb();
      if (config?.defaultRateId && config.defaultRateId === rateId) {
        throw new ShippingDefaultRateZoneAssignmentValidationError();
      }

      // Primero, desasignamos esta tarifa de todos los municipios que la tengan actualmente
      await prisma.municipality.updateMany({
        where: { shippingRateId: rateId },
        data: { shippingRateId: null },
      });

      // Luego, si hay nuevos municipios, los asignamos
      if (municipalityIds && municipalityIds.length > 0) {
        await prisma.municipality.updateMany({
          where: { id: { in: municipalityIds } },
          data: { shippingRateId: rateId },
        });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
