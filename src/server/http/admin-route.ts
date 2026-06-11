import { NextResponse } from "next/server";
import { requireAdmin, type AdminAuthContext } from "@/server/auth/require-admin";
import { toErrorResponse } from "./error-response";

type AdminRouteHandler = (context: AdminAuthContext) => Promise<NextResponse>;

export async function runAdminRoute(handler: AdminRouteHandler): Promise<NextResponse> {
  try {
    const admin = await requireAdmin();
    return await handler(admin);
  } catch (error) {
    return toErrorResponse(error);
  }
}
