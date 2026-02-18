import type { UseFormRegister, UseFormHandleSubmit, FieldErrors } from "react-hook-form";

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface UseRegisterFormReturn {
  register: UseFormRegister<RegisterFormData>;
  handleSubmit: UseFormHandleSubmit<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  error: string | null;
  success: string | null;
  isLoading: boolean;
  onSubmit: (data: RegisterFormData) => Promise<void>;
  handleGoogleLogin: () => void;
}
