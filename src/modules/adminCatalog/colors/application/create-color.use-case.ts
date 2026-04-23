import type { CreateColorInputDTO } from "../contracts/color.dto";
import { createColorInputSchema } from "../contracts/color.schema";
import { normalizeColorName, normalizeHexCode } from "../domain/color.entity";
import { PrismaColorRepository } from "../infrastructure/prisma-color.repository";
import { ColorConflictError, ColorValidationError } from "./color.errors";

const colorRepository = new PrismaColorRepository();

export async function createColorUseCase(input: unknown) {
  const parsed = createColorInputSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new ColorValidationError(firstIssue?.message ?? "Datos inválidos");
  }

  const dto: CreateColorInputDTO = {
    name: normalizeColorName(parsed.data.name),
    hexCode: normalizeHexCode(parsed.data.hexCode),
  };

  const existing = await colorRepository.findByName(dto.name);
  if (existing) {
    throw new ColorConflictError("Ya existe un color con ese nombre");
  }

  return colorRepository.createColor(dto);
}
