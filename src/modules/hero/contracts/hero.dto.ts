import { z } from "zod";
import {
  createHeroSlideSchema,
  mediaFocusSchema,
  updateHeroSettingsSchema,
  updateHeroSlideSchema,
} from "./hero.schema";

export type CreateHeroSlideInputDTO = z.infer<typeof createHeroSlideSchema>;
export type UpdateHeroSlideInputDTO = z.infer<typeof updateHeroSlideSchema>;
export type UpdateHeroSettingsInputDTO = z.infer<typeof updateHeroSettingsSchema>;
export type MediaFocusDTO = z.infer<typeof mediaFocusSchema>;

export interface HeroSlideDTO {
  id: string;
  position: number;
  mediaUrl: string;
  mediaUrlMobile: string | null;
  mediaUrlTablet: string | null;
  posterUrl: string | null;
  mediaType: string;
  headline: string | null;
  subheadline: string | null;
  mediaFocus: MediaFocusDTO | null;
  playFullVideo: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HeroSettingsDTO {
  id: number;
  slideDurationMs: number;
  updatedAt: Date;
}

export type HeroPreviousMedia = {
  mediaUrl: string | null;
  mediaUrlMobile: string | null;
  mediaUrlTablet: string | null;
  posterUrl: string | null;
};
