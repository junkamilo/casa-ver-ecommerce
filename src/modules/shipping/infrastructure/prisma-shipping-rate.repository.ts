import { prisma as db } from "@/lib/prisma";

export async function listShippingRatesDb() {
  return db.shippingRate.findMany({
    include: { _count: { select: { municipalities: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function createShippingRateDb(data: { name?: string | null; price: number }) {
  return db.shippingRate.create({ data });
}

export async function updateShippingRateDb(
  id: string,
  data: { name?: string | null; price?: number }
) {
  return db.shippingRate.update({ where: { id }, data });
}

export async function getShippingRateByIdDb(id: string) {
  return db.shippingRate.findUnique({ where: { id } });
}

export async function getShippingRateUsageDb(id: string) {
  const municipalitiesCount = await db.municipality.count({ where: { shippingRateId: id } });
  return { departmentsCount: 0, municipalitiesCount };
}

export async function deleteShippingRateDb(id: string) {
  return db.shippingRate.delete({ where: { id } });
}
