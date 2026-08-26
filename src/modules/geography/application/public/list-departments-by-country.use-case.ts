import { listActiveDepartmentsByCountry } from "../../infrastructure/prisma-department.repository";
import { cachedGeoRead, registerGeoKey } from "../../infrastructure/geography-cache";
import { toDepartmentPublicDTO } from "../../presentation/geography.mappers";
import type { DepartmentPublicDTO } from "../../contracts/geography.dto";

export async function listDepartmentsByCountryUseCase(
  countryId: string,
): Promise<DepartmentPublicDTO[]> {
  const cacheKey = `departments:country:${countryId}`;
  registerGeoKey(cacheKey);
  return cachedGeoRead(cacheKey, async () => {
    const departments = await listActiveDepartmentsByCountry(countryId);
    return departments.map(toDepartmentPublicDTO);
  });
}
