"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { useLoginForm } from "./hooks/useLoginForm";
import EmailField from "./components/EmailField";
import PasswordField from "./components/PasswordField";
import AuthAlert from "@/components/ui/auth/AuthAlert";
import AuthFormHeader from "@/components/ui/auth/AuthFormHeader";
import DividerOr from "@/components/ui/auth/DividerOr";
import GoogleButton from "@/components/ui/auth/GoogleButton";
import SubmitButton from "@/components/ui/auth/SubmitButton";

const LoginForm = () => {
  const { register, handleSubmit, errors, error, isLoading, onSubmit, handleGoogleLogin } =
    useLoginForm();

  return (
    <div className="w-full max-w-md mx-auto">
      <AuthFormHeader
        title="Bienvenido de nuevo"
        subtitle="Ingresa a tu cuenta para gestionar tus pedidos"
      />

      <AuthAlert message={error} variant="error" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        <EmailField register={register} errors={errors} />
        <PasswordField register={register} errors={errors} />
        <SubmitButton isLoading={isLoading} label="Iniciar sesión" icon={LogIn} />
      </form>

      <DividerOr />
      <GoogleButton isLoading={isLoading} onClick={handleGoogleLogin} />

      <p className="mt-7 text-center text-sm text-gray-500">
        ¿No tienes cuenta?{" "}
        <Link
          href="/registro"
          className="font-semibold text-[#154734] hover:text-[#C19A6B] transition-colors"
        >
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
