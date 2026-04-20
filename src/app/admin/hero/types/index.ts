export interface HeroSlideData {
  id: string;
  position: number;
  mediaUrl: string;
  mediaType: "image" | "video";
  headline: string | null;
  subheadline: string | null;
  isActive: boolean;
  updatedAt: string;
}
