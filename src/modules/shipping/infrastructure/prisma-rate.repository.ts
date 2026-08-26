import { prisma as db } from "@/lib/prisma";

export async function getRateContextForMunicipality(municipalityId: string) {
  return db.municipality.findUnique({
    where: { id: municipalityId },
    select: {
      isActive: true,
      shippingRate: { select: { name: true, price: true, isActive: true } },
      department: true,
    },
  });
}
