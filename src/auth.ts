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

  pages: { signIn: "/login", error: "/login" },

  callbacks: {
    async signIn({ account, profile }) {
      // Para Google: rechazar si el correo no está verificado por Google.
      // Toda la lógica de earlyBird/emailVerified se maneja en el callback jwt
      // porque ahí el adapter ya garantiza user.id y user.email correctos.
      if (account?.provider !== "google") return true;
      const emailVerified = (profile as any)?.email_verified;
      if (!emailVerified) return false;
      return true;
    },

    async jwt({ token, user, account }) {
      if (!user) return token; // solo corre en el login inicial

      token.id   = user.id;
      token.role = (user as any).role;

      // El email del usuario viene del adapter (fuente confiable para todos los proveedores)
      const email = user.email;

      if (account?.provider === "google" && email) {
        // 1. Marcar emailVerified (el PrismaAdapter no siempre lo hace en v5 beta)
        await prisma.user.updateMany({
          where: { email },
          data: { emailVerified: new Date() },
        });

        // 2. Early Bird: nuevos usuarios de Google (ventana 5 min)
        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: { id: true, createdAt: true, earlyBirdDiscount: true },
        });

        if (dbUser && !dbUser.earlyBirdDiscount) {
          const isNewUser = Date.now() - dbUser.createdAt.getTime() < 5 * 60_000;

          if (isNewUser) {
            const PROMO_ID = "early-bird-2026";
            const claimed: number = await prisma.$executeRaw`
              UPDATE "promotions"
              SET   "currentUses" = "currentUses" + 1,
                    "updatedAt"   = NOW()
              WHERE "id"          = ${PROMO_ID}
                AND "isActive"    = true
                AND "currentUses" < "maxUses"
                AND ("startDate" IS NULL OR "startDate" <= NOW())
                AND ("endDate"   IS NULL OR "endDate"   >= NOW())
            `;

            if (claimed > 0) {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { earlyBirdDiscount: true, earlyBirdDiscountAt: new Date() },
              });
              token.earlyBirdDiscount = true;
            }
          }
        }

        // 3. Leer el valor final (puede haber sido true ya antes)
        if (!token.earlyBirdDiscount) {
          const updated = await prisma.user.findUnique({
            where: { id: user.id as string },
            select: { earlyBirdDiscount: true },
          });
          token.earlyBirdDiscount = updated?.earlyBirdDiscount ?? false;
        }
      } else {
        // Credentials y otros proveedores
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { earlyBirdDiscount: true },
        });
        token.earlyBirdDiscount = dbUser?.earlyBirdDiscount ?? false;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).earlyBirdDiscount = token.earlyBirdDiscount ?? false;
      }
      return session;
    },
  },
});
