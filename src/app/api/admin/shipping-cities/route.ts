import { NextResponse } from "next/server";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";
import { prisma } from "@/lib/prisma";
import { AssignCityRateSchema } from "@/modules/shipping/contracts/shipping.dto";

export async function GET() {
  return runAdminRoute(async () => {
    try {
      const municipalities = await prisma.municipality.findMany({
        where: { shippingRateId: { not: null } },
        include: {
          department: true,
          shippingRate: true,
        },
        orderBy: { name: "asc" },
      });

      const dtos = municipalities.map((m) => ({
        id: m.id,
        name: m.name,
        department: {
          name: m.department.name,
        },
        shippingRate: {
          id: m.shippingRate!.id,
          name: m.shippingRate!.name,
          price: m.shippingRate!.price,
        },
      }));

      return NextResponse.json(dtos);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

export async function POST(request: Request) {
  return runAdminRoute(async () => {
    try {
      const body = await request.json();
      const { cityId, shippingRateId } = AssignCityRateSchema.parse(body);

      await prisma.municipality.update({
        where: { id: cityId },
        data: { shippingRateId },
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
