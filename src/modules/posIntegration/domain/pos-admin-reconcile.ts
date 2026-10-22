import type { PosWebAdmin } from "../contracts/pos-admin.schema";

export type LocalAdminCandidate = {
  id: string;
  email: string | null;
  name: string | null;
  role: "USER" | "ADMIN";
  posUserId: string | null;
};

export type AdminSyncPlan = {
  /** Cuentas de la web que pasan a (o siguen siendo) admin enlazadas a su usuario del POS. */
  updates: { id: string; data: { role: "ADMIN"; posUserId: string; name: string; email?: string } }[];
  /** Admins del POS sin cuenta en la web: se crea la cuenta (entran con su contraseña del POS o con Google). */
  creates: { email: string; name: string; role: "ADMIN"; posUserId: string }[];
  /** Admins de la web que el POS ya no publica: vuelven a ser clientes. */
  demotions: string[];
  conflicts: string[];
};

const normalizeEmail = (email: string | null | undefined) => (email ?? "").trim().toLowerCase();

/**
 * El POS decide quién es admin de la web. Cada admin del POS se enlaza con su cuenta por posUserId o,
 * la primera vez, por email (así un cliente existente pasa a ser admin sin perder su historial). Los
 * admins de la web que no estén en la lista del POS vuelven a USER. Solo se escribe lo que cambia.
 */
export function planAdminSync(pos: PosWebAdmin[], local: LocalAdminCandidate[]): AdminSyncPlan {
  const byPosId = new Map(local.filter((u) => u.posUserId).map((u) => [u.posUserId as string, u]));
  const byEmail = new Map(local.filter((u) => u.email).map((u) => [normalizeEmail(u.email), u]));
  const matched = new Set<string>();
  const plan: AdminSyncPlan = { updates: [], creates: [], demotions: [], conflicts: [] };

  for (const admin of pos) {
    const email = normalizeEmail(admin.email);
    const linked = byPosId.get(admin.userId);
    const sameEmail = byEmail.get(email);
    const user = linked ?? (sameEmail && !sameEmail.posUserId ? sameEmail : undefined);

    if (!user) {
      if (sameEmail) {
        plan.conflicts.push(`${email}: la cuenta de la web ya está enlazada a otro usuario del POS`);
        continue;
      }
      plan.creates.push({ email, name: admin.fullName, role: "ADMIN", posUserId: admin.userId });
      continue;
    }
    matched.add(user.id);

    const data: AdminSyncPlan["updates"][number]["data"] = {
      role: "ADMIN",
      posUserId: admin.userId,
      name: admin.fullName,
    };
    if (normalizeEmail(user.email) !== email) {
      // Cambió el email en el POS: solo si no lo usa otra cuenta de la web.
      if (sameEmail && sameEmail.id !== user.id) {
        plan.conflicts.push(`${email}: ya existe otra cuenta de la web con ese email; se conserva ${user.email}`);
      } else {
        data.email = email;
      }
    }
    const changed =
      user.role !== "ADMIN" || user.posUserId !== admin.userId || user.name !== admin.fullName || data.email !== undefined;
    if (changed) plan.updates.push({ id: user.id, data });
  }

  for (const user of local) {
    if (matched.has(user.id)) continue;
    if (user.role === "ADMIN" || user.posUserId) plan.demotions.push(user.id);
  }
  return plan;
}
