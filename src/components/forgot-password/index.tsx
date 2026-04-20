"use client";

import { useForgotPasswordForm } from "./hooks";
import { RecoveryEmailStep, NewPasswordStep, SuccessStep } from "./components";
import VerifyCodeStep from "@/components/register/components/VerifyCodeStep";

interface ForgotPasswordFormProps {
  initialTokenId?: string;
  initialCode?: string;
}

const ForgotPasswordForm = ({ initialTokenId, initialCode }: ForgotPasswordFormProps) => {
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
  } = useForgotPasswordForm({ initialTokenId, initialCode });

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
