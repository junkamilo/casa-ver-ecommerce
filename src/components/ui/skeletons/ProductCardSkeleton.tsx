const ProductCardSkeleton = () => (
  <div className="rounded-2xl bg-gray-200 animate-pulse overflow-hidden shrink-0 w-[65vw] sm:w-[40vw] md:w-full aspect-4/5 relative">
    <div className="absolute inset-0 flex flex-col justify-end p-6 gap-2">
      <div className="h-4 w-2/3 bg-gray-300 rounded" />
      <div className="h-3 w-1/3 bg-gray-300 rounded" />
    </div>
  </div>
);

export default ProductCardSkeleton;
