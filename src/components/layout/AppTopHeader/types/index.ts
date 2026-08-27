export interface AppTopHeaderProps {
  onMenuOpen: () => void;
  breadcrumbRoot?: string;
  breadcrumbCurrent?: string;
  /** Slot para elementos extra antes de "Ver Tienda" (ej. NotificationsBell en admin) */
  rightSlot?: React.ReactNode;
}

export interface BreadcrumbProps {
  root?: string;
  current?: string;
  onMenuOpen: () => void;
}

export interface HeaderActionsProps {
  rightSlot?: React.ReactNode;
}
