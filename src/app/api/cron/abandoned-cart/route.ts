import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAbandonedCartEmail } from "@/services/email/client";

// Carritos inactivos por más de 1 hora sin email enviado
const ABANDONED_AFTER_MS = 60 * 60 * 1000;

function verifyCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - ABANDONED_AFTER_MS);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://casaverdeoficial.com";

  const abandonedCarts = await prisma.cart.findMany({
    where: {
      updatedAt:           { lt: cutoff },
      abandonedEmailSentAt: null,
      items:               { some: {} },
      user: {
        email:         { not: null },
        emailVerified: { not: null },
        orders:        {
          // Solo si no tiene una orden reciente (checkout en progreso o completado)
          none: { createdAt: { gt: cutoff } },
        },
      },
    },
    include: {
      user:  { select: { email: true, name: true } },
      items: true,
    },
    take: 50,
  });

  let sent = 0;
  let failed = 0;

  for (const cart of abandonedCarts) {
    if (!cart.user.email) continue;

    const result = await sendAbandonedCartEmail({
      customerEmail: cart.user.email,
      items: cart.items.map((i) => ({
        name:     i.name,
        price:    Number(i.price),
        imageUrl: i.imageUrl,
        color:    i.color,
        size:     i.size,
      })),
      cartUrl: `${baseUrl}/carrito`,
    });

    if (result.success) {
      await prisma.cart.update({
        where: { id: cart.id },
        data:  { abandonedEmailSentAt: new Date() },
      });
      sent++;
    } else {
      failed++;
      console.error(`[Cron/AbandonedCart] Error para cart ${cart.id}:`, result.error);
    }
  }

  console.log(`[Cron/AbandonedCart] Procesados: ${abandonedCarts.length}, enviados: ${sent}, fallidos: ${failed}`);
  return NextResponse.json({ processed: abandonedCarts.length, sent, failed });
}
