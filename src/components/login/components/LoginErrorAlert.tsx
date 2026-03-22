interface LoginErrorAlertProps {
  error: string | null;
}

const LoginErrorAlert = ({ error }: LoginErrorAlertProps) => {
  if (!error) return null;

  return (
    <div className="mb-5 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-2 rounded text-xs sm:text-sm animate-in fade-in">
      <span className="mt-0.5 shrink-0">⚠</span>
      <p>{error}</p>
    </div>
  );
};

export default LoginErrorAlert;
