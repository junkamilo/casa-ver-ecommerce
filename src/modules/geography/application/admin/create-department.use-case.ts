import { Prisma } from "@prisma/client";
import { CreateDepartmentSchema } from "../../contracts/geography.dto";
import { findCountryById } from "../../infrastructure/prisma-country.repository";
import { createDepartment } from "../../infrastructure/prisma-department.repository";
import { invalidateGeography } from "../../infrastructure/geography-cache";
import {
  CountryNotFoundError,
  GeographyDuplicateConflictError,
  GeographyValidationError,
} from "../errors";

export async function createDepartmentUseCase(rawInput: unknown) {
  const parsed = CreateDepartmentSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new GeographyValidationError(
      "Datos de departamento inválidos",
      parsed.error.format(),
    );
  }

  // Verificar que el país padre exista
  const country = await findCountryById(parsed.data.countryId);
  if (!country) throw new CountryNotFoundError(parsed.data.countryId);

  try {
    const department = await createDepartment(parsed.data);
    await invalidateGeography();
    return department;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new GeographyDuplicateConflictError(
        "Departamento",
        "Ya existe un departamento con ese nombre o código DANE en este país",
      );
    }
    throw error;
  }
}
