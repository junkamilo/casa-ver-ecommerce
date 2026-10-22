import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyPosAdminPassword } from "@/modules/posIntegration/application/verify-pos-admin.use-case";

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

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) throw new InvalidCredentials();

        // Admin gestionado por el POS (Configuraciones → Usuarios): la contraseña es la del POS y la
        // verifica el POS. Nunca se usa la contraseña guardada en la web para estas cuentas.
        if (user.posUserId) {
          const outcome = await verifyPosAdminPassword(email, password, clientIpOf(request));
          if (outcome === "too_many_attempts") throw new TooManyAttempts();
          if (outcome === "unavailable") throw new AdminUnavailable();
          if (outcome !== "valid") throw new InvalidCredentials();
          return { id: user.id, name: user.name, email: user.email, role: user.role };
        }

        if (!user.password) throw new UseGoogleSignIn();

        const match = await compare(password, user.password);
        if (!match) throw new InvalidCredentials();

        if (!user.emailVerified) throw new EmailNotVerified();

        return { id: user.id, name: user.name, email: user.email, role: user.role };
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
        token.role = (user as { role?: string }).role;
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

      // Refrescar role desde DB (evita ADMIN demoted con JWT stale hasta 30 días)
      const userId = (token.id ?? token.sub) as string | undefined;
      if (userId) {
        const lastRefresh = typeof token.roleCheckedAt === "number" ? token.roleCheckedAt : 0;
        const now = Date.now();
        if (user || now - lastRefresh > 5 * 60 * 1000) {
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
          });
          token.role = dbUser?.role ?? "USER";
          token.roleCheckedAt = now;
        }
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
