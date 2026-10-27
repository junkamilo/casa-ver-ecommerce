import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  isActivePosAdmin,
  isPosAdminEmail,
  verifyPosAdminLogin,
} from "@/modules/posIntegration/application/verify-pos-admin.use-case";

/** Cada cuánto la sesión de un admin confirma con el POS que sigue siendo admin activo de la web. */
const ADMIN_RECHECK_MS = 5 * 60 * 1000;

class InvalidCredentials extends CredentialsSignin {
  code = "invalid_credentials";
}
class UseGoogleSignIn extends CredentialsSignin {
  code = "use_google";
}
class EmailNotVerified extends CredentialsSignin {
  code = "email_not_verified";
}
class TooManyAttempts extends CredentialsSignin {
  code = "too_many_attempts";
}
class AdminUnavailable extends CredentialsSignin {
  code = "admin_unavailable";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Permite fusionar automáticamente la cuenta Google con una cuenta
      // existente de email/contraseña cuando ambas comparten el mismo correo.
      // Es seguro para Google porque siempre verifica la titularidad del email.
      allowDangerousEmailAccountLinking: true,
      // Muestra el selector de cuentas de Google para que el usuario pueda elegir.
      // Eliminamos "consent" y access_type:"offline" — causaban que Google
      // invalidara el authorization code en ciertos flujos (invalid_grant).
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),

    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        // Administradores: 100 % del POS (Configuraciones → Usuarios). El POS verifica la contraseña (la
        // misma del POS), que siga siendo admin de la web y activo, y limita los intentos. La sesión lleva el
        // id del POS y no se crea ninguna fila en Neon. `null` = no se sabe si es admin (POS caído).
        const isAdmin = await isPosAdminEmail(email);
        if (isAdmin !== false) {
          const login = await verifyPosAdminLogin(email, password, clientIpOf(request));
          if (login.outcome === "valid") {
            return { id: login.admin.userId, name: login.admin.fullName, email: login.admin.email, role: "ADMIN" };
          }
          if (login.outcome === "too_many_attempts") throw new TooManyAttempts();
          if (isAdmin && login.outcome === "unavailable") throw new AdminUnavailable();
          // Contraseña de admin incorrecta o POS sin respuesta: puede ser su cuenta de cliente.
        }

        // Clientes de la tienda: viven en Neon.
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) throw new InvalidCredentials();

        if (!user.password) throw new UseGoogleSignIn();

        const match = await compare(password, user.password);
        if (!match) throw new InvalidCredentials();

        if (!user.emailVerified) throw new EmailNotVerified();

        return { id: user.id, name: user.name, email: user.email, role: "USER" };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días — expira sesión aunque no haya logout
  },

  pages: { signIn: "/login", error: "/login" },

  callbacks: {
    async signIn({ account, profile }) {
      // Para Google: rechazar si el correo no está verificado por Google.
      // emailVerified se maneja en el callback jwt porque ahí el adapter
      // ya garantiza user.id y user.email correctos.
      if (account?.provider !== "google") return true;
      const emailVerified = (profile as { email_verified?: boolean } | undefined)?.email_verified;
      if (!emailVerified) return false;
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        // Google y clientes: siempre USER. ADMIN solo lo da el POS en el login con contraseña.
        token.role = (user as { role?: string }).role === "ADMIN" ? "ADMIN" : "USER";
        token.roleCheckedAt = Date.now();
      }

      // Sesiones JWT antiguas pueden no tener id — NextAuth lo guarda en sub
      if (!token.id && token.sub) {
        token.id = token.sub;
      }

      const email = user?.email ?? (token.email as string | undefined);

      if (account?.provider === "google" && email) {
        await prisma.user.updateMany({
          where: { email },
          data: { emailVerified: new Date() },
        });
      }

      // Admin: cada 5 minutos se confirma con el POS que siga siendo admin activo de la web. Si el POS le
      // quitó el acceso (o la sesión es de antes de esta migración, con un id de Neon) se cierra la sesión.
      // Si el POS no responde, la sesión sigue hasta que vuelva.
      const userId = (token.id ?? token.sub) as string | undefined;
      if (token.role === "ADMIN" && userId) {
        const lastCheck = typeof token.roleCheckedAt === "number" ? token.roleCheckedAt : 0;
        if (Date.now() - lastCheck > ADMIN_RECHECK_MS) {
          const active = await isActivePosAdmin(userId);
          if (active === false) return null;
          if (active) token.roleCheckedAt = Date.now();
        }
      } else if (token.role !== "USER") {
        token.role = "USER";
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        const userId = (token.id ?? token.sub) as string | undefined;
        (session.user as { id?: string }).id = userId;
        (session.user as { role?: string }).role = token.role as string | undefined;
      }
      return session;
    },
  },
});

/** IP del visitante (Vercel la pone primera en x-forwarded-for), para el límite de intentos del POS. */
function clientIpOf(request: Request | undefined): string | null {
  const forwarded = request?.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request?.headers.get("x-real-ip") || null;
}
