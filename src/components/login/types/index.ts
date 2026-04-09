import type { UseFormRegister, UseFormHandleSubmit, FieldErrors } from "react-hook-form";

export interface LoginFormData {
  email: string;
  password: string;
}

export interface UseLoginFormReturn {
  register: UseFormRegister<LoginFormData>;
  handleSubmit: UseFormHandleSubmit<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
  error: string | null;
  isLoading: boolean;
  onSubmit: (data: LoginFormData) => Promise<void>;
  handleGoogleLogin: () => void;
}
