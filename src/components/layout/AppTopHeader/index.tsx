import type { AppTopHeaderProps } from "./types";
import { Breadcrumb, HeaderActions } from "./components";

export default function AppTopHeader({
  onMenuOpen,
  breadcrumbRoot,
  breadcrumbCurrent,
  rightSlot,
}: AppTopHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-8 shadow-sm z-10 shrink-0">
      <Breadcrumb
        root={breadcrumbRoot}
        current={breadcrumbCurrent}
        onMenuOpen={onMenuOpen}
      />
      <HeaderActions rightSlot={rightSlot} />
    </header>
  );
}
