import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const orderNumber = process.argv[2] ?? "CV-MQBOKLYF-LGT8";
  const order = await prisma.order.findFirst({
    where: { orderNumber },
    select: { id: true, transactionId: true, status: true, boldLinkId: true },
  });

  if (!order?.transactionId) {
    console.error("Orden no encontrada:", orderNumber);
    process.exit(1);
  }

  if (order.status === "PAID") {
    console.log("Orden ya está PAID");
    return;
  }

  const keys = [
    process.env.BOLD_IDENTITY_KEY,
    "wOyI0aIPZG7RO5CP3pMzCEtzUt-dGOEGv9Z_hVh-TWI",
  ].filter(Boolean);

  let data = null;
  for (const key of keys) {
    const res = await fetch(
      `https://integrations.api.bold.co/online/link/v1/${encodeURIComponent(order.boldLinkId)}`,
      { headers: { Authorization: `x-api-key ${key}` } }
    );
    const json = await res.json();
    if (res.ok && json.status) {
      data = json;
      break;
    }
  }

  if (!data) {
    console.error("No se pudo consultar el link en Bold");
    process.exit(1);
  }

  if (data.status !== "PAID") {
    console.error("El link no está PAID en Bold — no se actualiza la orden");
    process.exit(1);
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      paymentId: data.transaction_id ?? order.boldLinkId,
    },
  });

  console.log("Orden marcada PAID:", orderNumber);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
