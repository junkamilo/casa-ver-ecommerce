import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col items-center justify-center px-2 py-6 sm:px-4 sm:py-12 md:px-6 lg:px-8">
      <div className="mb-4 sm:mb-8 text-center">
        <span className="text-2xl sm:text-4xl font-bold text-[#154734]" style={{ fontFamily: 'Georgia, serif' }}>
          Casa Verde
        </span>
      </div>

      <RegisterForm />
    </div>
  );
}
