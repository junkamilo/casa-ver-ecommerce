import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { rateLimit, getClientIP, RATE_LIMIT_CONFIGS } from "@/lib/ratelimit";

const cartItemSchema = z.object({
  variantId: z.string().min(1),
  productId: z.string().min(1),
  sku:       z.string().min(1),
  name:      z.string().min(1),
  price:     z.number().positive(),
  imageUrl:  z.string().optional().nullable(),
  color:     z.string(),
  size:      z.string(),
  quantity:  z.number().int().positive(),
});

const syncSchema = z.object({
  items: z.array(cartItemSchema).max(50),
});

export async function POST(request: NextRequest) {
  // ✅ RATE LIMITING: máximo 100 requests por minuto
  const ip = getClientIP(request);
  const rateLimitResult = await rateLimit(`${ip}:cart`, RATE_LIMIT_CONFIGS.cart);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas solicitudes. Intenta de nuevo más tarde." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.retryAfter),
        },
      }
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = syncSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Datos inválidos" }, { status: 400 });
  }

  const userId = session.user.id;
  const { items } = parsed.data;

  await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.upsert({
      where:  { userId },
      create: { userId },
      update: { updatedAt: new Date(), abandonedEmailSentAt: null },
      select: { id: true },
    });

    // Reemplazar todos los ítems del carrito
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    if (items.length > 0) {
      await tx.cartItem.createMany({
        data: items.map((item) => ({
          cartId:    cart.id,
          productId: item.productId,
          variantId: item.variantId,
          sku:       item.sku,
          name:      item.name,
          price:     item.price,
          imageUrl:  item.imageUrl ?? null,
          color:     item.color,
          size:      item.size,
          quantity:  item.quantity,
        })),
      });
    }
  });

  return NextResponse.json({ ok: true });
}

// Borrar carrito al completar compra
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  await prisma.cart.deleteMany({ where: { userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
