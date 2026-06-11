import type { ToggleCategoryInputDTO, UpdateCategoryInputDTO } from "../contracts/category.dto";
import { toggleCategoryInputSchema, updateCategoryInputSchema } from "../contracts/category.schema";
import { generateCategorySlug } from "../domain/category.entity";
import { PrismaCategoryRepository } from "../infrastructure/prisma-category.repository";
import {
  CategoryConflictError,
  CategoryNotFoundError,
  CategoryValidationError,
} from "./category.errors";

const categoryRepository = new PrismaCategoryRepository();

export async function updateCategoryUseCase(input: unknown) {
  const toggleParsed = toggleCategoryInputSchema.safeParse(input);
  if (toggleParsed.success) {
    return handleToggle(toggleParsed.data);
  }

  const updateParsed = updateCategoryInputSchema.safeParse(input);
  if (!updateParsed.success) {
    const firstIssue = updateParsed.error.issues[0];
    throw new CategoryValidationError(firstIssue?.message ?? "Datos inválidos");
  }

  return handleEdit(updateParsed.data);
}

async function handleToggle(dto: ToggleCategoryInputDTO) {
  const category = await categoryRepository.findById(dto.id);
  if (!category) {
    throw new CategoryNotFoundError("Categoría no encontrada");
  }

  if (category.isActive && category._count.products > 0) {
    throw new CategoryConflictError("No se puede desactivar una categoría con productos", {
      error: "has_products",
      count: category._count.products,
      name: category.name,
    });
  }

  return categoryRepository.toggleActive(dto.id, !category.isActive);
}

async function handleEdit(dto: UpdateCategoryInputDTO) {
  const slug = generateCategorySlug(dto.name);
  if (!slug) {
    throw new CategoryValidationError("El nombre ingresado no genera un slug válido");
  }

  const category = await categoryRepository.findCategoryBaseById(dto.id);
  if (!category) {
    throw new CategoryNotFoundError("Categoría no encontrada");
  }

  const existing = await categoryRepository.findBySlugExcludingId(slug, dto.id);
  if (existing) {
    throw new CategoryConflictError("Esta categoría ya existe");
  }

  return categoryRepository.updateCategoryAndReplaceGarments({
    id: dto.id,
    name: dto.name,
    slug,
    image: dto.image?.trim() || null,
    garmentTypeIds: dto.garmentTypeIds,
  });
}
