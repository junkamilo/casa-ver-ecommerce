import { fetchDashboardDataUseCase } from "../src/modules/adminCatalog/dashboard/application/fetch-dashboard-data.use-case.ts";

fetchDashboardDataUseCase()
  .then((d) => console.log("OK", JSON.stringify(d, null, 2)))
  .catch((e) => console.error("FAIL", e));
