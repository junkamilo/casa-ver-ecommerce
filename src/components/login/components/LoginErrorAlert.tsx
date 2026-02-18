import { AlertCircle } from "lucide-react";

interface LoginErrorAlertProps {
  error: string | null;
}

const LoginErrorAlert = ({ error }: LoginErrorAlertProps) => {
  if (!error) return null;

  return (
    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3 rounded text-xs sm:text-sm">
      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
      <p>{error}</p>
    </div>
  );
};

export default LoginErrorAlert;
