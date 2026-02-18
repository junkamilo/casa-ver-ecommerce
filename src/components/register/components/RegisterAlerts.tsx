import { AlertCircle, CheckCircle2 } from "lucide-react";

interface RegisterAlertsProps {
  error: string | null;
  success: string | null;
}

const RegisterAlerts = ({ error, success }: RegisterAlertsProps) => (
  <>
    {error && (
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3 rounded text-xs sm:text-sm animate-in fade-in">
        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
        <p>{error}</p>
      </div>
    )}
    {success && (
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border-l-4 border-green-500 text-green-700 flex items-center gap-3 rounded text-xs sm:text-sm animate-in fade-in">
        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
        <p>{success}</p>
      </div>
    )}
  </>
);

export default RegisterAlerts;
