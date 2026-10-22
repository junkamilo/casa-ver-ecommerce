import { isPosCatalogConfigured } from "@/modules/posIntegration/infrastructure/pos-config";
import { ShippingManagedByPosConflictError } from "./errors";

/** Con el POS conectado, la web no edita envíos ni geografía (se sincronizan desde el POS). */
export function isShippingManagedByPos(): boolean {
  return isPosCatalogConfigured();
}

export function assertShippingEditable(): void {
  if (isShippingManagedByPos()) throw new ShippingManagedByPosConflictError();
}
