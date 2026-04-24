import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { HeroUnauthorizedError, HeroValidationError } from "@/modules/adminCatalog/hero/application/hero.errors";
import { getActiveHeroSlidesUseCase, createHeroSlideUseCase, updateHeroSlideUseCase, deleteHeroSlideUseCase } from "@/modules/adminCatalog/hero/application/hero.use-cases";


async function getUserRole() {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (session?.user as any)?.role;
}

function handleError(error: unknown) {
  if (error instanceof HeroUnauthorizedError) return new NextResponse(error.message, { status: 403 });
  if (error instanceof HeroValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ error: "Error interno" }, { status: 500 });
}

export async function GET() {
  const slides = await getActiveHeroSlidesUseCase();
  return NextResponse.json(slides);
}

export async function POST(req: Request) {
  try {
    const role = await getUserRole();
    const body = await req.json();
    const slide = await createHeroSlideUseCase(body, role);
    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(req: Request) {
  try {
    const role = await getUserRole();
    const body = await req.json();
    const slide = await updateHeroSlideUseCase(body, role);
    return NextResponse.json(slide);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const role = await getUserRole();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    const result = await deleteHeroSlideUseCase(id, role);
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}