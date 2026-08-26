import { listDepartmentsWithRatesDb } from "../../infrastructure/prisma-department.repository";

export async function listShippingDepartmentsUseCase() {
  return listDepartmentsWithRatesDb();
}
