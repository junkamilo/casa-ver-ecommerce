/**
 * Reenvía el email de confirmación para órdenes PAID que nunca lo recibieron.
 *
 * Uso:
 *   node scripts/resend-order-confirmation.mjs
 *   node scripts/resend-order-confirmation.mjs CV-MQBOKLYF-LGT8
 */
import { PrismaClient } from "@prisma/client";
import { processEmailJob } from "../src/lib/email-queue.ts";

const prisma = new PrismaClient();
const orderNumberArg = process.argv[2];

const orders = await prisma.order.findMany({
  where: {
    status: "PAID",
    confirmationEmailSentAt: null,
    ...(orderNumberArg ? { orderNumber: orderNumberArg } : {}),
  },
  include: { items: true, user: true },
  orderBy: { paidAt: "desc" },
  take: orderNumberArg ? 1 : 20,
});

if (orders.length === 0) {
  console.log("No hay órdenes PAID sin email de confirmación.");
  process.exit(0);
}

for (const order of orders) {
  const customerEmail = order.user?.email;
  if (!customerEmail) {
    console.warn(`Omitido ${order.orderNumber}: sin email de cliente`);
    continue;
  }

  console.log(`Enviando confirmación para ${order.orderNumber} → ${customerEmail}`);

  await processEmailJob({
    type: "order-confirmation",
    orderId: order.id,
    payload: {
      customerEmail,
      customerName: order.shippingName,
      orderNumber: order.orderNumber,
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
        color: item.colorName,
        size: item.size,
        imageUrl: item.imageUrl ?? undefined,
      })),
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      discount: Number(order.discount),
      total: Number(order.total),
    },
  });

  const updated = await prisma.order.findUnique({
    where: { id: order.id },
    select: { confirmationEmailSentAt: true, confirmationEmailError: true },
  });

  if (updated?.confirmationEmailSentAt) {
    console.log(`  ✓ Enviado`);
  } else {
    console.log(`  ✗ Falló: ${updated?.confirmationEmailError ?? "error desconocido"}`);
  }
}

await prisma.$disconnect();
