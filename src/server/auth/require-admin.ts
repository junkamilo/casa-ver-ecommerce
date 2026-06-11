import { auth } from "@/auth";
import { ForbiddenError, UnauthenticatedError } from "./auth.errors";

export type AdminAuthContext = {
  userId: string;
  role: "ADMIN";
};

export async function requireAdmin(): Promise<AdminAuthContext> {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user) {
    throw new UnauthenticatedError();
  }

  if (user.role !== "ADMIN") {
    throw new ForbiddenError();
  }

  if (!user.id) {
    throw new UnauthenticatedError("Sesion invalida");
  }

  return { userId: user.id, role: "ADMIN" };
}
