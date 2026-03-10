interface CategoryCarouselSkeletonProps {
  count?: number;
}

const CategoryCarouselSkeleton = ({ count = 4 }: CategoryCarouselSkeletonProps) => (
  <div className="flex gap-4 sm:gap-6 pb-8 px-1 overflow-hidden">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="relative w-[65vw] sm:w-[40vw] md:w-[calc(25%-18px)] shrink-0 aspect-4/5 bg-gray-200 animate-pulse rounded"
        style={{ animationDelay: `${i * 80}ms` }}
      >
        <div className="absolute inset-0 flex flex-col justify-end p-6 gap-2">
          <div className="h-4 w-2/3 bg-gray-300 rounded" />
          <div className="h-3 w-1/3 bg-gray-300 rounded" />
        </div>
      </div>
    ))}
  </div>
);

export default CategoryCarouselSkeleton;
