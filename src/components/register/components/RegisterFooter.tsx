import Link from "next/link";

const RegisterFooter = () => (
  <div className="bg-gray-50 px-5 sm:px-8 py-3 sm:py-4 border-t border-gray-100 text-center">
    <p className="text-xs sm:text-sm text-gray-600">
      ¿Ya tienes cuenta?{" "}
      <Link
        href="/login"
        className="font-bold text-[color:var(--theme-primary)] hover:text-[color:var(--theme-accent)] transition-colors"
      >
        Inicia sesión aquí
      </Link>
    </p>
  </div>
);

export default RegisterFooter;
