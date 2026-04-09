import LoginForm from "@/components/login";
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
