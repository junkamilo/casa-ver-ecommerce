import type { DeleteGarmentTypeInputDTO } from "../contracts/garment-type.dto";
import { deleteGarmentTypeInputSchema } from "../contracts/garment-type.schema";
import { PrismaGarmentTypeRepository } from "../infrastructure/prisma-garment-type.repository";
import {
  GarmentTypeConflictError,
  GarmentTypeNotFoundError,
  GarmentTypeValidationError,
} from "./garment-type.errors";

const garmentTypeRepository = new PrismaGarmentTypeRepository();

export async function deleteGarmentTypeUseCase(input: unknown) {
  const parsed = deleteGarmentTypeInputSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new GarmentTypeValidationError(firstIssue?.message ?? "Datos inválidos");
  }

  const dto: DeleteGarmentTypeInputDTO = parsed.data;
  const gt = await garmentTypeRepository.findById(dto.id);
  if (!gt) {
    throw new GarmentTypeNotFoundError("No encontrado");
  }

  const total = gt._count.products;
  if (total > 0) {
    throw new GarmentTypeConflictError("No se puede eliminar porque tiene productos", {
      error: "has_products",
      count: total,
      name: gt.name,
    });
  }

  await garmentTypeRepository.deleteGarmentType(dto.id);
}
