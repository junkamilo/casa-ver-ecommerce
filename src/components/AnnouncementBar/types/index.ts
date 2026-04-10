import type { LucideIcon } from "lucide-react";

export interface Announcement {
  text: string;
  icon: LucideIcon;
}

export interface AnnouncementItemProps {
  item: Announcement;
  arrayIndex: number;
  index: number;
}
