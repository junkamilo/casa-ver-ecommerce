import type { CreateCategoryInputDTO } from "../contracts/category.dto";
import { createCategoryInputSchema } from "../contracts/category.schema";
import { generateCategorySlug } from "../domain/category.entity";
import { PrismaCategoryRepository } from "../infrastructure/prisma-category.repository";
import { CategoryConflictError, CategoryValidationError } from "./category.errors";

const categoryRepository = new PrismaCategoryRepository();

export async function createCategoryUseCase(input: unknown) {
  const parsed = createCategoryInputSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new CategoryValidationError(firstIssue?.message ?? "Datos inválidos");
  }

  const dto: CreateCategoryInputDTO = {
    name: parsed.data.name.trim(),
    image: parsed.data.image?.trim() || null,
    garmentTypeIds: parsed.data.garmentTypeIds,
  };

  const slug = generateCategorySlug(dto.name);
  if (!slug) {
    throw new CategoryValidationError("El nombre ingresado no genera un slug válido");
  }

  const existing = await categoryRepository.findBySlug(slug);
  if (existing) {
    throw new CategoryConflictError("Esta categoría ya existe");
  }

  const nextOrder = await categoryRepository.getNextOrder();
  return categoryRepository.createCategory({
    name: dto.name,
    slug,
    image: dto.image ?? null,
    garmentTypeIds: dto.garmentTypeIds,
    order: nextOrder,
  });
}
