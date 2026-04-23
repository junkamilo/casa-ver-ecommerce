import type { CreateGarmentTypeInputDTO } from "../contracts/garment-type.dto";
import { createGarmentTypeInputSchema } from "../contracts/garment-type.schema";
import { generateGarmentTypeSlug } from "../domain/garment-type.entity";
import { PrismaGarmentTypeRepository } from "../infrastructure/prisma-garment-type.repository";
import { GarmentTypeConflictError, GarmentTypeValidationError } from "./garment-type.errors";

const garmentTypeRepository = new PrismaGarmentTypeRepository();

export async function createGarmentTypeUseCase(input: unknown) {
  const parsed = createGarmentTypeInputSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new GarmentTypeValidationError(firstIssue?.message ?? "Datos inválidos");
  }

  const dto: CreateGarmentTypeInputDTO = { name: parsed.data.name.trim() };
  const slug = generateGarmentTypeSlug(dto.name);
  if (!slug) {
    throw new GarmentTypeValidationError("Nombre inválido");
  }

  const existing = await garmentTypeRepository.findBySlug(slug);
  if (existing) {
    throw new GarmentTypeConflictError("Este tipo de prenda ya existe");
  }

  const nextOrder = await garmentTypeRepository.getNextOrder();
  return garmentTypeRepository.createGarmentType({
    name: dto.name,
    slug,
    order: nextOrder,
  });
}
