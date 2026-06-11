import { PrismaGarmentTypeRepository } from "../infrastructure/prisma-garment-type.repository";

const garmentTypeRepository = new PrismaGarmentTypeRepository();

export async function listGarmentTypesUseCase() {
  return garmentTypeRepository.listGarmentTypes();
}
