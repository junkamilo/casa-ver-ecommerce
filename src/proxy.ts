import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // ── API de administración → requiere rol ADMIN, responde JSON ────────────
  if (pathname.startsWith("/api/admin")) {
    const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";
    if (!isAdmin) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // ── Rutas de administración → requiere rol ADMIN ─────────────────────────
  if (pathname.startsWith("/admin")) {
    const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";
    if (!isAdmin) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  // ── Rutas protegidas → requiere sesión activa (cualquier rol) ────────────
  // /checkout NO está aquí: la propia página muestra el modal para invitados
  const protectedPaths = ["/perfil"];
  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    if (!session) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  // ── Rutas de autenticación → redirigir si ya tiene sesión ────────────────
  const authPaths = ["/login", "/registro"];
  if (authPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    if (session) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/api/admin/:path*",
    "/admin/:path*",
    "/perfil/:path*",
    "/checkout/:path*",
    "/login",
    "/registro",
  ],
};
