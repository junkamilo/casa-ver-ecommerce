import { PrismaColorRepository } from "../infrastructure/prisma-color.repository";

const colorRepository = new PrismaColorRepository();

export async function listColorsUseCase(input: { onlyActive?: boolean }) {
  return colorRepository.listColors(Boolean(input.onlyActive));
}
