/** @jest-environment node */
import { posHeroSchema } from "../contracts/pos-banners.schema";
import { mapPosHeroSlides } from "../domain/pos-hero";

const hero = posHeroSchema.parse({
  slideDurationMs: 3000,
  slides: [
    {
      id: "b2",
      position: 2,
      mediaUrl: "https://pos.casaverde.co/api/media/files/b.mp4",
      posterUrl: "https://pos.casaverde.co/api/media/files/b.jpg",
      mediaType: "video",
      headline: null,
      mediaFocus: null,
      playFullVideo: true,
      linkUrl: null,
    },
    {
      id: "b1",
      position: 1,
      mediaUrl: "https://cdn.casaverde.co/a.jpg",
      mediaUrlMobile: "https://cdn.casaverde.co/a-m.jpg",
      mediaType: "image",
      headline: "Lino",
      subheadline: "Nueva colección",
      mediaFocus: { mobile: { x: 70, y: 30, zoom: 1.2 } },
      playFullVideo: true,
      linkUrl: "/collections/lino",
    },
    { id: "b3", position: 3, mediaUrl: "  ", mediaType: "image" },
  ],
});

describe("mapPosHeroSlides", () => {
  it("ordena por posición, descarta los que no tienen archivo y conserva enlace y encuadre", () => {
    const slides = mapPosHeroSlides(hero.slides);
    expect(slides.map((s) => s.id)).toEqual(["b1", "b2"]);
    expect(slides[0]).toEqual(
      expect.objectContaining({
        image: "https://cdn.casaverde.co/a.jpg",
        imageMobile: "https://cdn.casaverde.co/a-m.jpg",
        headline: "Lino",
        href: "/collections/lino",
        // «Esperar al video» solo aplica a videos.
        playFullVideo: false,
      }),
    );
    expect(slides[0].mediaFocus?.mobile).toEqual({ x: 70, y: 30, zoom: 1.2 });
    expect(slides[1]).toEqual(expect.objectContaining({ mediaType: "video", playFullVideo: true, href: undefined }));
  });

  it("un tipo desconocido se trata como imagen", () => {
    const parsed = posHeroSchema.parse({ slideDurationMs: 6000, slides: [{ id: "x", position: 1, mediaUrl: "https://a/b.jpg", mediaType: "gif" }] });
    expect(parsed.slides[0].mediaType).toBe("image");
  });
});
