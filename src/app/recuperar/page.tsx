import type { Metadata } from "next";
import { NOINDEX_METADATA } from "@/lib/seo";
import ForgotPasswordForm from "@/components/forgot-password";
import AuthLayout, { BenefitItem } from "@/components/ui/auth/AuthLayout";
import { STEPS } from "./constants";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  ...NOINDEX_METADATA,
};

interface RecuperarPageProps {
  searchParams: Promise<{ tokenId?: string; code?: string }>;
}

export default async function RecuperarPage({ searchParams }: RecuperarPageProps) {
  const { tokenId, code } = await searchParams;

  return (
    <AuthLayout
      eyebrow="Seguridad en"
      tagline={<>Tu cuenta protegida,<br />siempre a tu alcance</>}
      backHref="/login"
      backLabel="Volver al inicio de sesión"
      rightItems={STEPS.map(({ icon, text }, i) => (
        <BenefitItem key={text} icon={icon} text={text} step={i + 1} />
      ))}
    >
      <ForgotPasswordForm initialTokenId={tokenId} initialCode={code} />
    </AuthLayout>
  );
}
