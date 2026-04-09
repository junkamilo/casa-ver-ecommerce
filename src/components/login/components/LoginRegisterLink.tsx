import Link from "next/link";

const LoginRegisterLink = () => (
  <p className="mt-7 text-center text-sm text-gray-500">
    ¿No tienes cuenta?{" "}
    <Link
      href="/registro"
      className="font-semibold text-[#154734] hover:text-[#C19A6B] transition-colors"
    >
      Regístrate aquí
    </Link>
  </p>
);

export default LoginRegisterLink;
