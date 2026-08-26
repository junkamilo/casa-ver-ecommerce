import { Prisma } from "@prisma/client";
import { CreateCountrySchema } from "../../contracts/geography.dto";
import { createCountry } from "../../infrastructure/prisma-country.repository";
import { invalidateGeography } from "../../infrastructure/geography-cache";
import {
  GeographyDuplicateConflictError,
  GeographyValidationError,
} from "../errors";

export async function createCountryUseCase(rawInput: unknown) {
  const parsed = CreateCountrySchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new GeographyValidationError(
      "Datos de país inválidos",
      parsed.error.format(),
    );
  }

  try {
    const country = await createCountry(parsed.data);
    await invalidateGeography();
    return country;
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
