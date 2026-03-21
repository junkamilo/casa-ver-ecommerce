import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

async function verifyAdmin(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "ADMIN") return false;
  return true;
}

// GET — devuelve unreadCount + últimas 20 notificaciones
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const [unreadCount, notifications] = await Promise.all([
    (prisma as any).adminNotification.count({ where: { isRead: false } }),
    (prisma as any).adminNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        orderId: true,
        title: true,
        body: true,
        isRead: true,
        createdAt: true,
      },
    }),
  ]);

  return NextResponse.json({ unreadCount, notifications });
}
