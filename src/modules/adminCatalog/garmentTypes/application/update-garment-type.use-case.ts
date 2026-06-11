import type { ToggleGarmentTypeInputDTO, UpdateGarmentTypeInputDTO } from "../contracts/garment-type.dto";
import { toggleGarmentTypeInputSchema, updateGarmentTypeInputSchema } from "../contracts/garment-type.schema";
import { generateGarmentTypeSlug } from "../domain/garment-type.entity";
import { PrismaGarmentTypeRepository } from "../infrastructure/prisma-garment-type.repository";
import {
  GarmentTypeConflictError,
  GarmentTypeNotFoundError,
  GarmentTypeValidationError,
} from "./garment-type.errors";

const garmentTypeRepository = new PrismaGarmentTypeRepository();

export async function updateGarmentTypeUseCase(input: unknown) {
  const toggleParsed = toggleGarmentTypeInputSchema.safeParse(input);
  if (toggleParsed.success) {
    return handleToggle(toggleParsed.data);
  }

  const updateParsed = updateGarmentTypeInputSchema.safeParse(input);
  if (!updateParsed.success) {
    const firstIssue = updateParsed.error.issues[0];
    throw new GarmentTypeValidationError(firstIssue?.message ?? "Datos inválidos");
  }

  return handleEdit(updateParsed.data);
}

async function handleToggle(dto: ToggleGarmentTypeInputDTO) {
  const current = await garmentTypeRepository.findById(dto.id);
  if (!current) {
    throw new GarmentTypeNotFoundError("No encontrado");
  }

  return garmentTypeRepository.toggleActive(dto.id, !current.isActive);
}

async function handleEdit(dto: UpdateGarmentTypeInputDTO) {
  const slug = generateGarmentTypeSlug(dto.name);
  if (!slug) {
    throw new GarmentTypeValidationError("Nombre inválido");
  }

  const current = await garmentTypeRepository.findById(dto.id);
  if (!current) {
    throw new GarmentTypeNotFoundError("No encontrado");
  }

  const duplicate = await garmentTypeRepository.findBySlugExcludingId(slug, dto.id);
  if (duplicate) {
    throw new GarmentTypeConflictError("Este tipo de prenda ya existe");
  }

  return garmentTypeRepository.updateGarmentType({
    id: dto.id,
    name: dto.name.trim(),
    slug,
  });
}
