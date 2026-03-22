"use client";

import Link from "next/link";
import { useRegisterForm } from "./hooks/useRegisterForm";
import RegisterAlerts from "./components/RegisterAlerts";
import NameField from "./components/NameField";
import EmailField from "./components/EmailField";
import PasswordField from "./components/PasswordField";
import RecoveryEmailField from "./components/RecoveryEmailField";
import PhoneField from "./components/PhoneField";
import SubmitButton from "./components/SubmitButton";
import DividerOr from "./components/DividerOr";
import GoogleButton from "./components/GoogleButton";
import VerifyCodeStep from "./components/VerifyCodeStep";

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

  // ─── Paso de verificación por código ─────────────────────────────────────
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

  // ─── Formulario de registro ───────────────────────────────────────────────
  return (
    <div className="w-full max-w-md mx-auto">

      <div className="mb-7">
        <h2
          className="text-2xl sm:text-3xl font-bold text-[#154734] mb-1.5"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Crea tu cuenta
        </h2>
        <p className="text-sm text-gray-500">
          Completa los datos para unirte a la familia Casa Verde
        </p>
      </div>

      <RegisterAlerts error={error} success={success} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        <NameField register={register} errors={errors} />
        <EmailField register={register} errors={errors} />
        <PasswordField register={register} errors={errors} />
        <RecoveryEmailField register={register} errors={errors} emailValue={emailValue} setValue={setValue} />
        <PhoneField register={register} errors={errors} />
        <SubmitButton isLoading={isLoading} />
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
