import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Únete a Casa Verde y disfruta de beneficios exclusivos.",
};
import RegisterForm from "@/components/register";
import AuthLayout, { BenefitItem } from "@/components/ui/auth/AuthLayout";
import { BENEFITS } from "./constants";

export default function RegisterPage() {
  return (
    <AuthLayout
      eyebrow="Bienvenido a"
      tagline={<>Donde el estilo vive<br />con la naturaleza</>}
      formCenter={false}
      rightItems={BENEFITS.map((text) => (
        <BenefitItem key={text} icon={CheckCircle2} text={text} />
      ))}
    >
      <RegisterForm />
    </AuthLayout>
  );
}
