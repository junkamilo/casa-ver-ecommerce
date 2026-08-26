import { Prisma } from "@prisma/client";
import { CreateMunicipalitySchema } from "../../contracts/geography.dto";
import { isDaneConsistent } from "../../domain/validate-dane-consistency";
import { findDepartmentById } from "../../infrastructure/prisma-department.repository";
import { createMunicipality } from "../../infrastructure/prisma-municipality.repository";
import { invalidateGeography } from "../../infrastructure/geography-cache";
import {
  DaneConsistencyError,
  DepartmentNotFoundError,
  GeographyDuplicateConflictError,
  GeographyValidationError,
} from "../errors";

export async function createMunicipalityUseCase(rawInput: unknown) {
  // 1. Validación de forma
  const parsed = CreateMunicipalitySchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new GeographyValidationError(
      "Datos de municipio inválidos",
      parsed.error.format(),
    );
  }
  const input = parsed.data;

  // 2. Verificar que el departamento padre exista
  const dept = await findDepartmentById(input.departmentId);
  if (!dept) throw new DepartmentNotFoundError(input.departmentId);

  // 3. Verificación cruzada de DANE contra el departamento
  if (!isDaneConsistent(input.daneCode, dept.daneCode)) {
    throw new DaneConsistencyError(input.daneCode!, dept.daneCode!);
  }

  // 4. Inserción
  try {
    const municipality = await createMunicipality(input);
    await invalidateGeography();
    return municipality;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new GeographyDuplicateConflictError(
        "Municipio",
        "Ya existe un municipio con ese nombre o código DANE en este departamento",
      );
    }
    throw error;
  }
}
