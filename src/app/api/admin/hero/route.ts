import { NextResponse } from "next/server";
import {
  getActiveHeroSlidesUseCase,
  createHeroSlideUseCase,
  updateHeroSlideUseCase,
  deleteHeroSlideUseCase,
} from "@/modules/adminCatalog/hero/application/hero.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

export async function GET() {
  return runAdminRoute(async () => {
    try {
      const slides = await getActiveHeroSlidesUseCase();
      return NextResponse.json(slides);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

export async function POST(req: Request) {
  return runAdminRoute(async (admin) => {
    try {
      const body = await req.json();
      const slide = await createHeroSlideUseCase(body, admin.role);
      return NextResponse.json(slide, { status: 201 });
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

export async function PUT(req: Request) {
  return runAdminRoute(async (admin) => {
    try {
      const body = await req.json();
      const slide = await updateHeroSlideUseCase(body, admin.role);
      return NextResponse.json(slide);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

export async function DELETE(req: Request) {
  return runAdminRoute(async (admin) => {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
      const result = await deleteHeroSlideUseCase(id, admin.role);
      return NextResponse.json(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}