import { NextResponse } from "next/server";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";
import { assertShippingEditable } from "@/modules/shipping/application/shipping-editable";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ cityId: string }> }
) {
  return runAdminRoute(async () => {
    try {
      assertShippingEditable();
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
