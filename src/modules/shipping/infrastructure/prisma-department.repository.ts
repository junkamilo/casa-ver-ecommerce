import { prisma as db } from "@/lib/prisma";

export async function listDepartmentsWithRatesDb() {
  return db.department.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getAllDepartmentsFromDb() {
  return db.department.findMany();
}
