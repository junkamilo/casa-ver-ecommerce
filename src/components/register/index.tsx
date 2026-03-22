"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
import { useRegisterForm } from "./hooks/useRegisterForm";
import NameField from "./components/NameField";
import EmailField from "./components/EmailField";
import PasswordField from "./components/PasswordField";
import RecoveryEmailField from "./components/RecoveryEmailField";
import PhoneField from "./components/PhoneField";
import VerifyCodeStep from "./components/VerifyCodeStep";
import AuthAlert from "@/components/ui/auth/AuthAlert";
import AuthFormHeader from "@/components/ui/auth/AuthFormHeader";
import DividerOr from "@/components/ui/auth/DividerOr";
import GoogleButton from "@/components/ui/auth/GoogleButton";
import SubmitButton from "@/components/ui/auth/SubmitButton";

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
    error,
    success,
    isLoading,
    onSubmit,
    handleGoogleLogin,
    step,
    pendingEmail,
    onVerifyCode,
    onResendCode,
    onCodeReset,
  } = useRegisterForm();

  const emailValue = watch("email") ?? "";

  // ── Paso de verificación por código ───────────────────────────────────────
  if (step === "verify") {
    return (
      <VerifyCodeStep
        email={pendingEmail}
        isLoading={isLoading}
        error={error}
        success={success}
        onVerifyCode={onVerifyCode}
        onResendCode={onResendCode}
        onCodeReset={onCodeReset}
      />
    );
  }

  // ── Formulario de registro ────────────────────────────────────────────────
  return (
    <div className="w-full max-w-md mx-auto">
      <AuthFormHeader
        title="Crea tu cuenta"
        subtitle="Completa los datos para unirte a la familia Casa Verde"
      />

      <AuthAlert message={error}   variant="error" />
      <AuthAlert message={success} variant="success" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        <NameField register={register} errors={errors} />
        <EmailField register={register} errors={errors} />
        <PasswordField register={register} errors={errors} />
        <RecoveryEmailField
          register={register}
          errors={errors}
          emailValue={emailValue}
          setValue={setValue}
        />
        <PhoneField register={register} errors={errors} />
        <SubmitButton isLoading={isLoading} label="Crear mi cuenta" icon={UserPlus} />
      </form>

      <DividerOr />
      <GoogleButton isLoading={isLoading} onClick={handleGoogleLogin} />

      <p className="mt-7 text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#154734] hover:text-[#C19A6B] transition-colors"
        >
          Inicia sesión aquí
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;
