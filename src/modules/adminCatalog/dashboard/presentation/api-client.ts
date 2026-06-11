import { fetchDashboardDataUseCase } from "../application/fetch-dashboard-data.use-case";
import { mapDashboardDataDtoToUi } from "./mappers";

export async function fetchDashboardData() {
  const dto = await fetchDashboardDataUseCase();
  return mapDashboardDataDtoToUi(dto);
}
