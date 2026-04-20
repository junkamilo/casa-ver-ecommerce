function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`bg-white rounded-xl border border-gray-100 animate-pulse ${className}`} />;
}

export function EstadisticasLoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="space-y-3">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} className="h-28" />
          ))}
        </div>
      </div>

      {/* Ventas */}
      <div className="space-y-3">
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
        <SkeletonCard className="h-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonCard className="h-52" />
          <SkeletonCard className="h-52" />
        </div>
      </div>

      {/* Productos */}
      <div className="space-y-3">
        <div className="h-4 w-44 bg-gray-200 rounded animate-pulse" />
        <SkeletonCard className="h-72" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonCard className="h-52" />
          <SkeletonCard className="h-52" />
        </div>
      </div>

      {/* Categorías */}
      <div className="space-y-3">
        <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
        <SkeletonCard className="h-48" />
      </div>

      {/* Clientes */}
      <div className="space-y-3">
        <div className="h-4 w-44 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard className="h-44" />
          <SkeletonCard className="h-44" />
          <SkeletonCard className="h-44" />
        </div>
      </div>

      {/* Geografía */}
      <div className="space-y-3">
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        <SkeletonCard className="h-48" />
      </div>
    </div>
  );
}

export function LiveSectionSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl border border-gray-100 h-56 animate-pulse" />
        <div className="bg-white rounded-xl border border-gray-100 h-56 animate-pulse" />
      </div>
    </div>
  );
}
