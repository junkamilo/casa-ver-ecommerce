import Link from "next/link";

const LoginFooter = () => (
  <div className="bg-gray-50 px-5 sm:px-8 py-3 sm:py-4 border-t border-gray-100 text-center">
    <p className="text-xs sm:text-sm text-gray-600">
      ¿No tienes una cuenta?{" "}
      <Link
        href="/registro"
        className="font-bold text-[#154734] hover:text-[#C19A6B] transition-colors"
      >
        Regístrate aquí
      </Link>
    </p>
  </div>
);

export default LoginFooter;
