import { CheckCircle2 } from "lucide-react";
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
