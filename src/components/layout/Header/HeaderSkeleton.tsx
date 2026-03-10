export default function HeaderSkeleton() {
  return (
    <header className="w-full sticky top-0 z-50 bg-background/88 backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">

        {/* Izquierda: hamburguesa placeholder + logo placeholder + nav skeletons */}
        <div className="flex items-center gap-4 lg:gap-8">
          {/* Hamburguesa mobile */}
          <div className="lg:hidden w-6 h-6 rounded bg-gray-200 animate-pulse" />

          {/* Logo */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 animate-pulse shrink-0" />

          {/* Nav links — solo visible en desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            {["w-14", "w-16", "w-24"].map((w, i) => (
              <div key={i} className={`h-3 ${w} rounded bg-gray-200 animate-pulse`} />
            ))}
          </nav>
        </div>

        {/* Centro: "CASA VERDE" placeholder */}
        <div className="absolute left-1/2 -translate-x-1/2 w-36 h-7 sm:h-9 rounded bg-gray-200 animate-pulse" />

        {/* Derecha: íconos placeholder */}
        <div className="flex items-center gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-5 h-5 rounded-full bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    </header>
  );
}
