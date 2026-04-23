import type { ToggleColorInputDTO, UpdateColorInputDTO } from "../contracts/color.dto";
import { toggleColorInputSchema, updateColorInputSchema } from "../contracts/color.schema";
import { normalizeColorName, normalizeHexCode } from "../domain/color.entity";
import { PrismaColorRepository } from "../infrastructure/prisma-color.repository";
import { ColorConflictError, ColorNotFoundError, ColorValidationError } from "./color.errors";

const colorRepository = new PrismaColorRepository();

export async function updateColorUseCase(input: unknown) {
  const toggleParsed = toggleColorInputSchema.safeParse(input);
  if (toggleParsed.success) {
    return handleToggle(toggleParsed.data);
  }

  const updateParsed = updateColorInputSchema.safeParse(input);
  if (!updateParsed.success) {
    const firstIssue = updateParsed.error.issues[0];
    throw new ColorValidationError(firstIssue?.message ?? "Datos inválidos");
  }

  return handleEdit(updateParsed.data);
}

async function handleToggle(dto: ToggleColorInputDTO) {
  const color = await colorRepository.findById(dto.id);
  if (!color) {
    throw new ColorNotFoundError("Color no encontrado");
  }

  return colorRepository.toggleActive(dto.id, !color.isActive);
}

async function handleEdit(dto: UpdateColorInputDTO) {
  const color = await colorRepository.findById(dto.id);
  if (!color) {
    throw new ColorNotFoundError("Color no encontrado");
  }

  const name = normalizeColorName(dto.name);
  const hexCode = normalizeHexCode(dto.hexCode);
  const duplicate = await colorRepository.findByNameExcludingId(name, dto.id);
  if (duplicate) {
    throw new ColorConflictError("Ya existe un color con ese nombre");
  }

  return colorRepository.updateColor({
    id: dto.id,
    name,
    hexCode,
  });
}
