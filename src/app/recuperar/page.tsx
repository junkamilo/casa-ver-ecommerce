import { KeyRound, ShieldCheck, Lock } from "lucide-react";
import ForgotPasswordForm from "@/components/forgot-password";
import AuthLayout, { BenefitItem } from "@/components/ui/auth/AuthLayout";

const STEPS = [
  { icon: KeyRound,    text: "Ingresa tu correo de recuperación" },
  { icon: ShieldCheck, text: "Verifica el código que recibirás" },
  { icon: Lock,        text: "Crea tu nueva contraseña segura" },
] as const;

export default function RecuperarPage() {
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
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
