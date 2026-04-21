import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") return false;
  return true;
}

// GET /api/admin/reviews?status=PENDING&page=1&search=
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status  = searchParams.get("status") ?? "ALL";
    const search  = searchParams.get("search") ?? "";
    const page    = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit   = 20;
    const skip    = (page - 1) * limit;

    const where = {
      ...(status !== "ALL" ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : {}),
      ...(search
        ? {
            OR: [
              { comment: { contains: search, mode: "insensitive" as const } },
              { guestName: { contains: search, mode: "insensitive" as const } },
              { user: { name: { contains: search, mode: "insensitive" as const } } },
              { product: { name: { contains: search, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    };

    const [reviews, total] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prisma as any).review.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, slug: true } },
          order:   { select: { orderNumber: true } },
          user:    { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prisma as any).review.count({ where }),
    ]);

    return NextResponse.json({ reviews, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[Admin/Reviews GET]", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
