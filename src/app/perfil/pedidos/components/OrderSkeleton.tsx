export function OrderSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-lg" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
