import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") return false;
  return true;
}

// POST — marca todas las notificaciones no leídas como leídas
export async function POST() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  await (prisma as any).adminNotification.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ ok: true });
}
