import { NextResponse } from "next/server";
import { getAccountsDebugUseCase } from "@/modules/adminCatalog/accountsDebug/application/get-accounts-debug.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";


export async function GET() {
  return runAdminRoute(async (admin) => {
    try {
      const result = await getAccountsDebugUseCase(admin.role);
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
