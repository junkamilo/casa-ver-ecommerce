import { z } from "zod";
import { createHeroSlideSchema, updateHeroSlideSchema } from "./hero.schema";

export type CreateHeroSlideInputDTO = z.infer<typeof createHeroSlideSchema>;
export type UpdateHeroSlideInputDTO = z.infer<typeof updateHeroSlideSchema>;

export interface HeroSlideDTO {
  id: string;
  position: number;
  mediaUrl: string;
  mediaType: string;
  headline: string | null;
  subheadline: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}