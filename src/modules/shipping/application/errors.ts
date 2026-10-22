export class ShippingRateNotFoundError extends Error {
  constructor(message = "Tarifa de envío no encontrada") {
    super(message);
    this.name = "ShippingRateNotFoundError";
  }
}

export class ShippingRateNameConflictError extends Error {
  constructor(name: string) {
    super(`Ya existe una tarifa llamada "${name}"`);
    this.name = "ShippingRateNameConflictError";
  }
}

export class ShippingRateInUseConflictError extends Error {
  constructor(name: string, departmentsCount: number, municipalitiesCount: number) {
    const parts: string[] = [];
    if (departmentsCount > 0) parts.push(`${departmentsCount} departamento(s)`);
    if (municipalitiesCount > 0) parts.push(`${municipalitiesCount} municipio(s)`);
    super(`No se puede eliminar "${name}": está asignada a ${parts.join(" y ")}. Reasígnalas primero.`);
    this.name = "ShippingRateInUseConflictError";
  }
}

export class ShippingDefaultRateInactiveValidationError extends Error {
  constructor() {
    super("La tarifa nacional debe existir y estar activa");
    this.name = "ShippingDefaultRateInactiveValidationError";
  }
}

export class ShippingDefaultRateZoneAssignmentValidationError extends Error {
  constructor() {
    super("No se pueden asignar zonas a la tarifa nacional. Los municipios sin tarifa de zona usan la nacional por defecto.");
    this.name = "ShippingDefaultRateZoneAssignmentValidationError";
  }
}

/** Con el POS conectado, envíos y geografía se administran allá; la web solo los refleja. */
export class ShippingManagedByPosConflictError extends Error {
  constructor() {
    super("Los envíos y la geografía se administran en el POS (Configuraciones → Precio de envíos / Ciudades de envíos)");
    this.name = "ShippingManagedByPosConflictError";
  }
}
