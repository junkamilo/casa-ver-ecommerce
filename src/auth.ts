import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

class InvalidCredentials extends CredentialsSignin {
  code = "invalid_credentials";
}
class UseGoogleSignIn extends CredentialsSignin {
  code = "use_google";
}
class EmailNotVerified extends CredentialsSignin {
  code = "email_not_verified";
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
      // Fuerza el selector de cuentas de Google en cada intento de login.
      // Sin esto, Google reutiliza la sesión activa del navegador silenciosamente.
      authorization: {
        params: {
          prompt: "select_account consent", // "consent" fuerza a Google a re-emitir refresh_token
          access_type: "offline",            // solicita refresh_token
        },
      },
    }),

    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) throw new InvalidCredentials();
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

  pages: { signIn: "/login" },

  callbacks: {
    async signIn({ user, account, profile }) {
      // Solo se aplica lógica especial para el proveedor Google
      if (account?.provider !== "google") return true;

      // Rechazar si Google no confirmó la titularidad del correo.
      // Esto también cubre el caso en que la cuenta Google está en disputa.
      const emailVerifiedByGoogle = (profile as any)?.email_verified === true;
      if (!emailVerifiedByGoogle) return false;

      if (user.email) {
        // Leer el usuario antes de marcarlo como verificado
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, createdAt: true, earlyBirdDiscount: true },
        });

        // Marcar emailVerified en la cuenta propia (Credentials no lo hace).
        // Con allowDangerousEmailAccountLinking, PrismaAdapter ya vinculó el
        // Account de Google al User existente antes de llegar aquí.
        await prisma.user.updateMany({
          where: { email: user.email },
          data: { emailVerified: new Date() },
        });

        // Early Bird para nuevos usuarios de Google OAuth:
        // Si el usuario se acaba de crear (createdAt < 30 segundos) y aún no
        // tiene el descuento, intentamos reclamar el cupo de forma atómica —
        // la misma estrategia que usa verify-email para evitar race conditions.
        if (dbUser && !dbUser.earlyBirdDiscount) {
          const isNewUser = Date.now() - dbUser.createdAt.getTime() < 30_000;

          if (isNewUser) {
            const EARLY_BIRD_PROMOTION_ID = "early-bird-2026";

            const claimed: number = await prisma.$executeRaw`
              UPDATE "promotions"
              SET "currentUses" = "currentUses" + 1,
                  "updatedAt"   = NOW()
              WHERE "id"        = ${EARLY_BIRD_PROMOTION_ID}
                AND "isActive"  = true
                AND "currentUses" < "maxUses"
                AND ("startDate" IS NULL OR "startDate" <= NOW())
                AND ("endDate"   IS NULL OR "endDate"   >= NOW())
            `;

            if (claimed > 0) {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: {
                  earlyBirdDiscount: true,
                  earlyBirdDiscountAt: new Date(),
                },
              });
            }
          }
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});
