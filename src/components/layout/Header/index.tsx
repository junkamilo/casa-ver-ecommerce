import { Suspense } from "react";
import HeaderAsync from "./components/HeaderAsync";
import HeaderSkeleton from "./components/HeaderSkeleton";

export default function Header() {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <HeaderAsync />
    </Suspense>
  );
}
