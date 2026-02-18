"use client";

import { useLoginForm } from "./hooks/useLoginForm";
import LoginHeader from "./components/LoginHeader";
import LoginErrorAlert from "./components/LoginErrorAlert";
import EmailField from "./components/EmailField";
import PasswordField from "./components/PasswordField";
import SubmitButton from "./components/SubmitButton";
import DividerOr from "./components/DividerOr";
import GoogleButton from "./components/GoogleButton";
import LoginFooter from "./components/LoginFooter";

const LoginForm = () => {
  const { register, handleSubmit, errors, error, isLoading, onSubmit, handleGoogleLogin } =
    useLoginForm();

  return (
    <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden mx-4 sm:mx-0">
      <div className="p-5 sm:p-8">
        <LoginHeader />
        <LoginErrorAlert error={error} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
          <EmailField register={register} errors={errors} />
          <PasswordField register={register} errors={errors} />
          <SubmitButton isLoading={isLoading} />
        </form>

        <DividerOr />
        <GoogleButton isLoading={isLoading} onClick={handleGoogleLogin} />
      </div>

      <LoginFooter />
    </div>
  );
};

export default LoginForm;
