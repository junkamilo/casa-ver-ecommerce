import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { markNotificationsReadUseCase } from "@/modules/adminCatalog/notifications/application/mark-notifications-read.use-case";

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

  const result = await markNotificationsReadUseCase();
  return NextResponse.json(result);
}
