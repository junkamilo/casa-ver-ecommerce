import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import NotFoundView from "@/components/ui/NotFoundView";

export default function NotFound() {
  return (
    <div className="flex flex-col bg-[#FAFAFA]">
      {/* Este bloque ocupa al menos el 100% del viewport — el footer queda fuera */}
      <div className="min-h-screen flex flex-col">
        <AnnouncementBar />
        <Header />
        <NotFoundView
          title="Página no encontrada"
          description="El contenido que buscas no existe o fue removido. Explora nuestra tienda y descubre nuestras colecciones."
          backHref="/tienda"
          backLabel="Ver productos"
        />
      </div>
      <Footer />
    </div>
  );
}
