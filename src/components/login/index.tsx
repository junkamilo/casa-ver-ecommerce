"use client";

import Link from "next/link";
import { useLoginForm } from "./hooks/useLoginForm";
import LoginHeader from "./components/LoginHeader";
import LoginErrorAlert from "./components/LoginErrorAlert";
import EmailField from "./components/EmailField";
import PasswordField from "./components/PasswordField";
import SubmitButton from "./components/SubmitButton";
import DividerOr from "./components/DividerOr";
import GoogleButton from "./components/GoogleButton";

const LoginForm = () => {
  const { register, handleSubmit, errors, error, isLoading, onSubmit, handleGoogleLogin } =
    useLoginForm();

  return (
    <div className="w-full max-w-md mx-auto">
      <LoginHeader />
      <LoginErrorAlert error={error} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        <EmailField register={register} errors={errors} />
        <PasswordField register={register} errors={errors} />
        <SubmitButton isLoading={isLoading} />
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
