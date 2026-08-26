import { listActiveMunicipalitiesByDepartment } from "../../infrastructure/prisma-municipality.repository";
import { cachedGeoRead, registerGeoKey } from "../../infrastructure/geography-cache";
import { toMunicipalityPublicDTO } from "../../presentation/geography.mappers";
import type { MunicipalityPublicDTO } from "../../contracts/geography.dto";

export async function listMunicipalitiesByDepartmentUseCase(
  departmentId: string,
): Promise<MunicipalityPublicDTO[]> {
  const cacheKey = `municipalities:dept:${departmentId}`;
  registerGeoKey(cacheKey);
  return cachedGeoRead(cacheKey, async () => {
    const municipalities = await listActiveMunicipalitiesByDepartment(departmentId);
    return municipalities.map(toMunicipalityPublicDTO);
  });
}
