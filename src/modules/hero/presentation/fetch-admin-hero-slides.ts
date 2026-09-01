import { getAllHeroSlidesUseCase, getHeroSettingsUseCase } from "../application/hero.use-case";
import { mapHeroSettingsToUi, mapHeroSlideDtoListToUi } from "./mappers";

/** Solo para Server Components (page admin/hero). No usar desde Client Components. */
export async function fetchAdminHeroSlides() {
  const slides = await getAllHeroSlidesUseCase();
  return mapHeroSlideDtoListToUi(slides);
}

export async function fetchAdminHeroSettings() {
  const settings = await getHeroSettingsUseCase();
  return mapHeroSettingsToUi(settings);
}
