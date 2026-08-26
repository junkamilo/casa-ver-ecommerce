import { prisma as db } from "@/lib/prisma";
import type { ShippingConfig } from "@prisma/client";

export async function getShippingConfigFromDb() {
  return db.shippingConfig.findUnique({
    where: { id: "singleton" },
    include: { defaultRate: true },
  });
}

export async function upsertShippingConfigDb(data: {
  freeShippingThreshold: number;
  defaultRateId?: string | null;
}): Promise<ShippingConfig> {
  return db.shippingConfig.upsert({
    where: { id: "singleton" },
    update: data,
    create: {
      id: "singleton",
      freeShippingThreshold: data.freeShippingThreshold,
      defaultRateId: data.defaultRateId ?? null,
    },
  });
}
