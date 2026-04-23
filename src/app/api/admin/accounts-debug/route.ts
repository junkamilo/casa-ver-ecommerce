import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAccountsDebugUseCase } from "@/modules/adminCatalog/accountsDebug/application/get-accounts-debug.use-case";
import { AccountUnauthorizedError } from "@/modules/adminCatalog/accountsDebug/application/account.errors";


export async function GET() {
  try {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session?.user as any)?.role;

    const result = await getAccountsDebugUseCase(userRole);
    return NextResponse.json(result);

  } catch (error) {
    if (error instanceof AccountUnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    console.error(error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
