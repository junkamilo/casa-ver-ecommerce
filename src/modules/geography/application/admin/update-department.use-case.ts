import { Prisma } from "@prisma/client";
import { UpdateDepartmentSchema } from "../../contracts/geography.dto";
import {
  findDepartmentById,
  updateDepartment,
} from "../../infrastructure/prisma-department.repository";
import { invalidateGeography } from "../../infrastructure/geography-cache";
import {
  DepartmentNotFoundError,
  GeographyDuplicateConflictError,
  GeographyValidationError,
} from "../errors";

export async function updateDepartmentUseCase(id: string, rawInput: unknown) {
  const parsed = UpdateDepartmentSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new GeographyValidationError(
      "Datos de actualización inválidos",
      parsed.error.format(),
    );
  }

  const existing = await findDepartmentById(id);
  if (!existing) throw new DepartmentNotFoundError(id);

  try {
    const updated = await updateDepartment(id, parsed.data);
    await invalidateGeography();
    return updated;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new GeographyDuplicateConflictError(
        "Departamento",
        "Ya existe un departamento con ese nombre o código DANE",
      );
    }
    throw error;
  }
}
