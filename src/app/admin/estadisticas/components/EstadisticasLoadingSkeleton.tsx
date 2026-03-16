export function EstadisticasLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-6 shadow-sm animate-pulse"
          >
            <div className="h-10 w-10 bg-gray-200 rounded-lg mb-4" />
            <div className="h-8 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-32 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 h-80 animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 w-full bg-gray-100 rounded" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 h-80 animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded mb-6" />
          <div className="flex justify-center items-center h-64">
            <div className="w-32 h-32 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 w-full bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
