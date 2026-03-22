"use client";

import { useForgotPasswordForm } from "./hooks/useForgotPasswordForm";
import RecoveryEmailStep from "./components/RecoveryEmailStep";
import VerifyCodeStep from "@/components/register/components/VerifyCodeStep";
import NewPasswordStep from "./components/NewPasswordStep";
import SuccessStep from "./components/SuccessStep";

const ForgotPasswordForm = () => {
  const {
    step,
    error,
    success,
    isLoading,
    pendingRecoveryEmail,
    registerEmail,
    handleSubmitEmail,
    errorsEmail,
    onSubmitEmail,
    onVerifyCode,
    onResendCode,
    onCodeReset,
    registerPassword,
    handleSubmitPassword,
    errorsPassword,
    onSubmitNewPassword,
  } = useForgotPasswordForm();

  if (step === "email") {
    return (
      <RecoveryEmailStep
        register={registerEmail}
        handleSubmit={handleSubmitEmail}
        errors={errorsEmail}
        error={error}
        success={success}
        isLoading={isLoading}
        onSubmit={onSubmitEmail}
      />
    );
  }

  if (step === "verify") {
    return (
      <VerifyCodeStep
        email={pendingRecoveryEmail}
        isLoading={isLoading}
        error={error}
        success={success}
        onVerifyCode={onVerifyCode}
        onResendCode={onResendCode}
        onCodeReset={onCodeReset}
      />
    );
  }

  if (step === "new-pass") {
    return (
      <NewPasswordStep
        register={registerPassword}
        handleSubmit={handleSubmitPassword}
        errors={errorsPassword}
        error={error}
        isLoading={isLoading}
        onSubmit={onSubmitNewPassword}
      />
    );
  }

  return <SuccessStep />;
};

export default ForgotPasswordForm;
