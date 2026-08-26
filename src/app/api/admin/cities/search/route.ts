import { NextResponse } from "next/server";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  return runAdminRoute(async () => {
    try {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get("q") || "";
      if (query.length < 2) return NextResponse.json([]);

      const municipalities = await prisma.municipality.findMany({
        where: {
          name: { contains: query, mode: "insensitive" },
        },
        take: 20,
        include: {
          department: true,
          shippingRate: true,
        },
        orderBy: { name: "asc" },
      });

      const config = await prisma.shippingConfig.findUnique({
        where: { id: "singleton" },
        include: { defaultRate: true },
      });
      const fallbackRate = config?.defaultRate;

      const dtos = municipalities.map((m) => {
        const rate = m.shippingRate || fallbackRate;
        return {
          id: m.id,
          name: m.name,
          department: {
            name: m.department.name,
            shippingRate: rate
              ? {
                  id: rate.id,
                  name: rate.name,
                  price: rate.price,
                }
              : null,
          },
        };
      });

      return NextResponse.json(dtos);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
