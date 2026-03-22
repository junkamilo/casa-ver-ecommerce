import { CheckCircle2 } from "lucide-react";
import RegisterForm from "@/components/register";
import AuthLayout, { BenefitItem } from "@/components/ui/auth/AuthLayout";

const BENEFITS = [
  "Acceso a ofertas y descuentos exclusivos",
  "Seguimiento en tiempo real de tus pedidos",
  "Guarda tus direcciones y paga más rápido",
] as const;

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
