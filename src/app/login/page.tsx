import { Package, Star, ShieldCheck } from "lucide-react";
import LoginForm from "@/components/login";
import AuthLayout, { BenefitItem } from "@/components/ui/auth/AuthLayout";

const BENEFITS = [
  { icon: Package,    text: "Seguimiento en tiempo real de tus pedidos" },
  { icon: Star,       text: "Acceso a ofertas y descuentos exclusivos" },
  { icon: ShieldCheck, text: "Compra segura con tus datos protegidos" },
] as const;

export default function LoginPage() {
  return (
    <AuthLayout
      eyebrow="Tu cuenta en"
      tagline={<>Donde el estilo vive<br />con la naturaleza</>}
      rightItems={BENEFITS.map(({ icon, text }) => (
        <BenefitItem key={text} icon={icon} text={text} />
      ))}
    >
      <LoginForm />
    </AuthLayout>
  );
}
