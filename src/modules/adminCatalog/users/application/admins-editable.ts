import { isPosCatalogConfigured } from "@/modules/posIntegration/infrastructure/pos-config";
import { UserAdminConflictError } from "./user-admin.errors";

/** Con el POS conectado, los administradores de la web se crean y se retiran en el POS (Configuraciones → Usuarios). */
export function areAdminsManagedByPos(): boolean {
  return isPosCatalogConfigured();
}

export function assertAdminsEditable(): void {
  if (areAdminsManagedByPos()) {
    throw new UserAdminConflictError("Los administradores se gestionan en el POS (Configuraciones → Usuarios)");
  }
}
