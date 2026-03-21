import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
