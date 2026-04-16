"use client";

import { LogIn } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useLoginForm } from "./hooks/useLoginForm";
import EmailField from "./components/EmailField";
import PasswordField from "./components/PasswordField";
import AuthAlert from "@/components/ui/auth/AuthAlert";
import AuthFormHeader from "@/components/ui/auth/AuthFormHeader";
import DividerOr from "@/components/ui/auth/DividerOr";
import GoogleButton from "@/components/ui/auth/GoogleButton";
import SubmitButton from "@/components/ui/auth/SubmitButton";
import LoginRegisterLink from "./components/LoginRegisterLink";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthCallback:     "Cancelaste el inicio de sesión con Google. Puedes intentarlo de nuevo.",
  OAuthCallbackError:"Cancelaste el inicio de sesión con Google. Puedes intentarlo de nuevo.",
  AccessDenied:      "Cancelaste el inicio de sesión con Google. Puedes intentarlo de nuevo.",
  Configuration:     "Hubo un problema con la configuración del servidor. Intenta de nuevo.",
  Verification:      "El enlace de verificación expiró. Solicita uno nuevo.",
  Default:           "Ocurrió un error al iniciar sesión. Intenta de nuevo.",
};

interface LoginFormProps {
  returnTo?: string;
}

const LoginForm = ({ returnTo }: LoginFormProps) => {
  const searchParams = useSearchParams();
  const authErrorCode = searchParams.get("error");
  const authError = authErrorCode
    ? (AUTH_ERROR_MESSAGES[authErrorCode] ?? AUTH_ERROR_MESSAGES.Default)
    : null;

  const { register, handleSubmit, errors, error, isLoading, onSubmit, handleGoogleLogin } =
    useLoginForm({ returnTo });

  return (
    <div className="w-full max-w-md mx-auto">
      <AuthFormHeader
        title="Bienvenido de nuevo"
        subtitle="Ingresa a tu cuenta para gestionar tus pedidos"
      />

      <AuthAlert message={authError ?? error} variant="error" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        <EmailField register={register} errors={errors} />
        <PasswordField register={register} errors={errors} />
        <SubmitButton isLoading={isLoading} label="Iniciar sesión" icon={LogIn} />
      </form>

      <DividerOr />
      <GoogleButton isLoading={isLoading} onClick={handleGoogleLogin} />

      <LoginRegisterLink />
    </div>
  );
};

export default LoginForm;
