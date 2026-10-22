import { prisma } from "@/lib/prisma";
import { planAdminSync } from "../domain/pos-admin-reconcile";
import { listWebAdmins } from "../infrastructure/pos-catalog.client";
import { PosSyncConflictError } from "../infrastructure/prisma-pos-sync.repository";

export type PosAdminSyncResult =
  | { status: "synced"; promoted: number; created: number; demoted: number; conflicts: string[] }
  | { status: "skipped"; reason: string };

/**
 * Refleja los administradores de la web que decide el POS (Configuraciones → Usuarios). Los clientes
 * registrados en la web no se tocan, salvo que el POS los marque como admin (se enlazan por email).
 * Se usa con el aviso `admin.upserted` y en el respaldo diario.
 */
export async function syncAdminsFromPos(): Promise<PosAdminSyncResult> {
  const admins = await listWebAdmins();
  if (admins === null) return { status: "skipped", reason: "El POS no publica administradores (sin endpoint)" };

  // Una lista vacía dejaría la web sin administradores: es más probable una falla o un POS sin migrar.
  if (admins.length === 0) {
    throw new PosSyncConflictError("El POS no devolvió administradores de la web; no se quitó ningún rol");
  }

  const emails = admins.map((a) => a.email.trim().toLowerCase());
  const local = await prisma.user.findMany({
    where: {
      OR: [
        { role: "ADMIN" },
        { posUserId: { not: null } },
        { email: { in: emails, mode: "insensitive" } },
      ],
    },
    select: { id: true, email: true, name: true, role: true, posUserId: true },
  });

  const plan = planAdminSync(admins, local);
  // Primero las degradaciones: liberan posUserId antes de enlazarlo a otra cuenta.
  await prisma.$transaction([
    prisma.user.updateMany({ where: { id: { in: plan.demotions } }, data: { role: "USER", posUserId: null } }),
    ...plan.updates.map(({ id, data }) => prisma.user.update({ where: { id }, data })),
    ...plan.creates.map((data) => prisma.user.create({ data })),
  ]);

  if (plan.conflicts.length > 0) console.warn("[POS admins] conflictos:", plan.conflicts);
  return {
    status: "synced",
    promoted: plan.updates.length,
    created: plan.creates.length,
    demoted: plan.demotions.length,
    conflicts: plan.conflicts,
  };
}
