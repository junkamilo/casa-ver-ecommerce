"use client";

import type { AppSidebarProps } from "./types";
import { MobileDrawer, DesktopSidebar } from "./components";

export default function AppSidebar({
  isOpen,
  onToggle,
  navItems,
  brandSubtitle,
  userName,
  userInitial,
  userRole,
  backLink,
  extraLink,
}: AppSidebarProps) {
  return (
    <>
      {isOpen && (
        <MobileDrawer
          onToggle={onToggle}
          navItems={navItems}
          brandSubtitle={brandSubtitle}
          userName={userName}
          userInitial={userInitial}
          userRole={userRole}
          backLink={backLink}
          extraLink={extraLink}
        />
      )}
      <DesktopSidebar
        isOpen={isOpen}
        onToggle={onToggle}
        navItems={navItems}
        brandSubtitle={brandSubtitle}
        userName={userName}
        userInitial={userInitial}
        userRole={userRole}
        backLink={backLink}
        extraLink={extraLink}
      />
    </>
  );
}
