import { Prisma } from "@prisma/client";
import { UpdateMunicipalitySchema } from "../../contracts/geography.dto";
import { isDaneConsistent } from "../../domain/validate-dane-consistency";
import {
  findMunicipalityById,
  updateMunicipality,
} from "../../infrastructure/prisma-municipality.repository";
import { invalidateGeography } from "../../infrastructure/geography-cache";
import {
  DaneConsistencyError,
  MunicipalityNotFoundError,
  GeographyDuplicateConflictError,
  GeographyValidationError,
} from "../errors";

export async function updateMunicipalityUseCase(id: string, rawInput: unknown) {
  const parsed = UpdateMunicipalitySchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new GeographyValidationError(
      "Datos de actualización inválidos",
      parsed.error.format(),
    );
  }

  // Verificar existencia (el include trae department para validar DANE)
  const existing = await findMunicipalityById(id);
  if (!existing) throw new MunicipalityNotFoundError(id);

  // Si actualizan el daneCode, re-verificar consistencia con el departamento
  if (parsed.data.daneCode !== undefined) {
    const { prisma } = await import("@/lib/prisma");
    const dept = await prisma.department.findUnique({
      where: { id: existing.departmentId },
      select: { daneCode: true },
    });
    if (dept && !isDaneConsistent(parsed.data.daneCode, dept.daneCode)) {
      throw new DaneConsistencyError(parsed.data.daneCode!, dept.daneCode!);
    }
  }

  try {
    const updated = await updateMunicipality(id, parsed.data);
    await invalidateGeography();
    return updated;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new GeographyDuplicateConflictError(
        "Municipio",
        "Ya existe un municipio con ese nombre o código DANE",
      );
    }
    throw error;
  }
}
