/**
 * One-shot repair: if shipping_configs.defaultRateId is NULL, point it at an
 * existing national rate (name "Nacional" or "Tarifa Nacional").
 *
 * Safe: UPDATE only on shipping_configs. Does NOT touch municipalities,
 * does NOT drop/reset the database, does NOT backfill shippingRateId FKs.
 *
 * Usage: npm run repair:default-shipping-rate
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const config = await db.shippingConfig.findUnique({
    where: { id: "singleton" },
  });

  if (!config) {
    console.log("⚠️  No hay fila shipping_configs (singleton). Nada que reparar.");
    return;
  }

  if (config.defaultRateId) {
    const rate = await db.shippingRate.findUnique({
      where: { id: config.defaultRateId },
    });
    console.log(
      `✅ defaultRateId ya está configurado: ${config.defaultRateId}` +
        (rate ? ` (${rate.name ?? "sin nombre"} / $${rate.price})` : " (tarifa no encontrada)")
    );
    return;
  }

  const nacional = await db.shippingRate.findFirst({
    where: {
      OR: [
        { name: { equals: "Nacional", mode: "insensitive" } },
        { name: { equals: "Tarifa Nacional", mode: "insensitive" } },
      ],
      isActive: true,
    },
    orderBy: { createdAt: "asc" },
  });

  if (!nacional) {
    console.log(
      "⚠️  defaultRateId es NULL y no se encontró una tarifa activa llamada " +
        '"Nacional" o "Tarifa Nacional". Configúrala desde Admin → Precio envíos.'
    );
    return;
  }

  await db.shippingConfig.update({
    where: { id: "singleton" },
    data: { defaultRateId: nacional.id },
  });

  console.log(
    `✅ defaultRateId reparado → ${nacional.id} (${nacional.name} / $${nacional.price})`
  );
}

main()
  .catch((err) => {
    console.error("❌ Error reparando defaultRateId:", err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
