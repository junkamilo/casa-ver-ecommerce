import ProductCardSkeleton from "./ProductCardSkeleton";

interface ProductGridSkeletonProps {
  count?: number;
}

const ProductGridSkeleton = ({ count = 4 }: ProductGridSkeletonProps) => (
  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export default ProductGridSkeleton;
