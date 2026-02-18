"use client";

import { useRegisterForm } from "./hooks/useRegisterForm";
import RegisterHeader from "./components/RegisterHeader";
import RegisterAlerts from "./components/RegisterAlerts";
import NameField from "./components/NameField";
import EmailField from "./components/EmailField";
import PasswordField from "./components/PasswordField";
import SubmitButton from "./components/SubmitButton";
import DividerOr from "./components/DividerOr";
import GoogleButton from "./components/GoogleButton";
import RegisterFooter from "./components/RegisterFooter";

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    errors,
    error,
    success,
    isLoading,
    onSubmit,
    handleGoogleLogin,
  } = useRegisterForm();

  return (
    <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden mx-4 sm:mx-0">
      <div className="p-5 sm:p-8">
        <RegisterHeader />
        <RegisterAlerts error={error} success={success} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
          <NameField register={register} errors={errors} />
          <EmailField register={register} errors={errors} />
          <PasswordField register={register} errors={errors} />
          <SubmitButton isLoading={isLoading} />
        </form>

        <DividerOr />
        <GoogleButton isLoading={isLoading} onClick={handleGoogleLogin} />
      </div>

      <RegisterFooter />
    </div>
  );
};

export default RegisterForm;
