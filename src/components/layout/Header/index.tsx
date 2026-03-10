import { Suspense } from "react";
import HeaderAsync from "./HeaderAsync";
import HeaderSkeleton from "./HeaderSkeleton";

export default function Header() {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <HeaderAsync />
    </Suspense>
  );
}
