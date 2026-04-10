import type { Metadata } from "next";
import { NOINDEX_METADATA } from "@/lib/seo";
import LoginForm from "@/components/login";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta Casa Verde.",
  ...NOINDEX_METADATA,
};
import AuthLayout, { BenefitItem } from "@/components/ui/auth/AuthLayout";
import { LOGIN_BENEFITS, LOGIN_EYEBROW } from "./constants";

export default function LoginPage() {
  return (
    <AuthLayout
      eyebrow={LOGIN_EYEBROW}
      tagline={<>Donde el estilo vive<br />con la naturaleza</>}
      rightItems={LOGIN_BENEFITS.map(({ icon, text }) => (
        <BenefitItem key={text} icon={icon} text={text} />
      ))}
    >
      <LoginForm />
    </AuthLayout>
  );
}
