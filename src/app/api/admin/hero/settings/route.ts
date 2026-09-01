import { NextResponse } from "next/server";
import {
  getHeroSettingsUseCase,
  updateHeroSettingsUseCase,
} from "@/modules/hero/application/hero.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";
import { revalidateHeroPages } from "@/lib/revalidate-hero-pages";

export async function GET() {
  return runAdminRoute(async () => {
    try {
      const settings = await getHeroSettingsUseCase();
      return NextResponse.json(settings);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

export async function PUT(req: Request) {
  return runAdminRoute(async (admin) => {
    try {
      const body = await req.json();
      const settings = await updateHeroSettingsUseCase(body, admin.role);
      revalidateHeroPages();
      return NextResponse.json(settings);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
