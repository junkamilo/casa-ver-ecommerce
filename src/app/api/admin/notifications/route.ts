import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listNotificationsUseCase } from "@/modules/adminCatalog/notifications/application/list-notifications.use-case";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") return false;
  return true;
}

// GET — devuelve unreadCount + últimas 20 notificaciones
export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const result = await listNotificationsUseCase();
  return NextResponse.json(result);
}
