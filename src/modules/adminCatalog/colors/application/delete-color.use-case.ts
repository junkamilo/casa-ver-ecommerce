import type { DeleteColorInputDTO } from "../contracts/color.dto";
import { deleteColorInputSchema } from "../contracts/color.schema";
import { PrismaColorRepository } from "../infrastructure/prisma-color.repository";
import { ColorNotFoundError, ColorValidationError } from "./color.errors";

const colorRepository = new PrismaColorRepository();

export async function deleteColorUseCase(input: unknown) {
  const parsed = deleteColorInputSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new ColorValidationError(firstIssue?.message ?? "Datos inválidos");
  }

  const dto: DeleteColorInputDTO = parsed.data;
  const color = await colorRepository.findById(dto.id);
  if (!color) {
    throw new ColorNotFoundError("Color no encontrado");
  }

  await colorRepository.deleteColor(dto.id);
  return { ok: true };
}
