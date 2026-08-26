import { Prisma } from "@prisma/client";
import { UpdateCountrySchema } from "../../contracts/geography.dto";
import {
  findCountryById,
  updateCountry,
} from "../../infrastructure/prisma-country.repository";
import { invalidateGeography } from "../../infrastructure/geography-cache";
import {
  CountryNotFoundError,
  GeographyDuplicateConflictError,
  GeographyValidationError,
} from "../errors";

export async function updateCountryUseCase(id: string, rawInput: unknown) {
  const parsed = UpdateCountrySchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new GeographyValidationError(
      "Datos de actualización inválidos",
      parsed.error.format(),
    );
  }

  // Verificar existencia
  const existing = await findCountryById(id);
  if (!existing) throw new CountryNotFoundError(id);

  try {
    const updated = await updateCountry(id, parsed.data);
    await invalidateGeography();
    return updated;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new GeographyDuplicateConflictError("País");
    }
    throw error;
  }
}
