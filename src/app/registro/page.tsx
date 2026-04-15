import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Únete a Casa Verde y disfruta de beneficios exclusivos.",
};
import RegisterForm from "@/components/register";
import AuthLayout, { BenefitItem } from "@/components/ui/auth/AuthLayout";
import { BENEFITS } from "./constants";

interface Props {
  searchParams: Promise<{ returnTo?: string }>;
}

export default async function RegisterPage({ searchParams }: Props) {
  const { returnTo } = await searchParams;

  // Permitir solo rutas internas para prevenir open-redirect
  const safeReturnTo =
    returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
      ? returnTo
      : "/";

  return (
    <AuthLayout
      eyebrow="Bienvenido a"
      tagline={<>Donde el estilo vive<br />con la naturaleza</>}
      formCenter={false}
      rightItems={BENEFITS.map((text) => (
        <BenefitItem key={text} icon={CheckCircle2} text={text} />
      ))}
    >
      <RegisterForm returnTo={safeReturnTo} />
    </AuthLayout>
  );
}
