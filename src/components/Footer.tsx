import { Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <h4 className="text-base sm:text-lg font-bold tracking-wider text-brand mb-4 sm:mb-6">MENÚ</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li><a href="#" className="text-sm text-foreground hover:text-brand transition-colors">TIENDA</a></li>
              <li><a href="#" className="text-sm text-foreground hover:text-brand transition-colors">FAVORITOS</a></li>
              <li><a href="#" className="text-sm text-foreground hover:text-brand transition-colors">NOSOTROS</a></li>
              <li><a href="#" className="text-sm text-foreground hover:text-brand transition-colors">CONTACTO</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-bold tracking-wider text-brand mb-4 sm:mb-6">POLÍTICAS</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li><a href="#" className="text-sm text-foreground hover:text-brand transition-colors">Aviso de privacidad</a></li>
              <li><a href="#" className="text-sm text-foreground hover:text-brand transition-colors">Términos y condiciones</a></li>
              <li><a href="#" className="text-sm text-foreground hover:text-brand transition-colors">Política de tratamiento de datos</a></li>
            </ul>
          </div>
          <div className="flex sm:justify-start lg:justify-end">
            <span className="text-3xl sm:text-4xl font-light tracking-wide text-brand" style={{ fontFamily: 'Georgia, serif' }}>
              Casa Verde
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-border px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 text-xs text-muted-foreground">
          <span>© 2026 Casa Verde,</span>
          <span>Diseño web: Casa Verde</span>
          <a href="#" className="text-brand hover:underline">Términos y políticas</a>
        </div>
        <a href="#" className="text-foreground hover:text-brand transition-colors">
          <Instagram className="w-5 h-5" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
