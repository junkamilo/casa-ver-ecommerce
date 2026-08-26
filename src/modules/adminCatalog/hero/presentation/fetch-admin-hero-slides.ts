import { getAllHeroSlidesUseCase } from "../application/hero.use-case";
import { mapHeroSlideDtoListToUi } from "./mappers";

/** Solo para Server Components (page admin/hero). No usar desde Client Components. */
export async function fetchAdminHeroSlides() {
  const slides = await getAllHeroSlidesUseCase();
  return mapHeroSlideDtoListToUi(slides);
}
