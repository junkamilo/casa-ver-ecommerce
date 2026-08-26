import { NextResponse } from "next/server";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ cityId: string }> }
) {
  return runAdminRoute(async () => {
    try {
      const { cityId } = await params;
      await prisma.municipality.update({
        where: { id: cityId },
        data: { shippingRateId: null },
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
