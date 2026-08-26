// ── Errores de dominio del módulo geography ──────────────────────────────────
// Todos terminan en "Error" para que toErrorResponse() los mapee automáticamente:
//   *NotFoundError  → 404
//   *ConflictError  → 409
//   *ValidationError → 400

export class CountryNotFoundError extends Error {
  constructor(id: string) {
    super(`País con id "${id}" no encontrado`);
    this.name = "CountryNotFoundError";
  }
}

export class DepartmentNotFoundError extends Error {
  constructor(id: string) {
    super(`Departamento con id "${id}" no encontrado`);
    this.name = "DepartmentNotFoundError";
  }
}

export class MunicipalityNotFoundError extends Error {
  constructor(id: string) {
    super(`Municipio con id "${id}" no encontrado`);
    this.name = "MunicipalityNotFoundError";
  }
}

export class DaneConsistencyError extends Error {
  constructor(municipalityDane: string, departmentDane: string) {
    super(
      `El DANE municipal "${municipalityDane}" no corresponde al departamento con DANE "${departmentDane}". ` +
      `Los primeros 2 dígitos del municipio deben coincidir con el código del departamento.`
    );
    this.name = "DaneConsistencyValidationError";
  }
}

export class GeographyDuplicateConflictError extends Error {
  constructor(entity: string, detail?: string) {
    super(
      detail
        ? `${entity} ya existe: ${detail}`
        : `${entity} ya existe con esos datos`
    );
    this.name = "GeographyDuplicateConflictError";
  }
}

export class GeographyValidationError extends Error {
  details: unknown;
  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "GeographyValidationError";
    this.details = details;
  }
}
