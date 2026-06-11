import { prisma } from "@/lib/prisma";
import type { ColorListItemDTO } from "../contracts/color.dto";

type ColorCreateData = {
  name: string;
  hexCode: string;
};

type ColorUpdateData = {
  id: string;
  name: string;
  hexCode: string;
};

export class PrismaColorRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.db = prisma as any;
  }

  async listColors(onlyActive = false): Promise<ColorListItemDTO[]> {
    return this.db.color.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { name: "asc" },
    });
  }

  async findByName(name: string) {
    return this.db.color.findUnique({ where: { name } });
  }

  async findByNameExcludingId(name: string, id: string) {
    return this.db.color.findFirst({ where: { name, NOT: { id } } });
  }

  async findById(id: string) {
    return this.db.color.findUnique({ where: { id } });
  }

  async createColor(data: ColorCreateData) {
    return this.db.color.create({ data });
  }

  async updateColor(data: ColorUpdateData) {
    return this.db.color.update({
      where: { id: data.id },
      data: {
        name: data.name,
        hexCode: data.hexCode,
      },
    });
  }

  async toggleActive(id: string, isActive: boolean) {
    return this.db.color.update({
      where: { id },
      data: { isActive },
    });
  }

  async deleteColor(id: string) {
    return this.db.color.delete({ where: { id } });
  }
}
