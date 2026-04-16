"use client";

import SectionHeader from "@/components/ui/SectionHeader";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
import CategoryCarouselSkeleton from "@/components/ui/skeletons/CategoryCarouselSkeleton";
import { useCarousel, useCategories } from "./hooks";
import { CategoryCard, CarouselNavButton } from "./components";
import { SECTION_CONFIG } from "./constants";

const Categories = () => {
  const { scrollRef, canScrollLeft, canScrollRight, scroll } = useCarousel();
  const { categories, loading } = useCategories();

  return (
    <section className="relative w-full py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 lg:px-12 bg-white overflow-hidden">

      <div className="relative max-w-7xl 2xl:max-w-6xl mx-auto">

        <SectionHeader
          title={SECTION_CONFIG.title}
          titleItalic={SECTION_CONFIG.titleItalic}
          href={SECTION_CONFIG.href}
          linkText={SECTION_CONFIG.linkText}
          textColor={SECTION_CONFIG.textColor}
          hoverColor={SECTION_CONFIG.hoverColor}
          fontClass={SECTION_CONFIG.fontClass}
        />

        <div className="relative mt-8 sm:mt-10 md:mt-12">

          {loading && <CategoryCarouselSkeleton count={4} />}

          {!loading && categories.length === 0 && (
            <SectionEmptyState message={SECTION_CONFIG.emptyMessage} />
          )}

          {!loading && categories.length > 0 && (
            <>
              {canScrollLeft && (
                <CarouselNavButton direction="left" onClick={() => scroll("left")} />
              )}

              {canScrollRight && (
                <CarouselNavButton direction="right" onClick={() => scroll("right")} />
              )}

              <div
                ref={scrollRef}
                className="grid grid-flow-col auto-cols-[80vw] sm:auto-cols-[50vw] md:auto-cols-[calc(25%-18px)] gap-3 sm:gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4 md:pb-2 snap-x snap-mandatory"
                style={{ scrollBehavior: "smooth" }}
              >
                {categories.map((cat) => (
                  <div key={cat.id} className="snap-start">
                    <CategoryCard
                      image={cat.image ?? ""}
                      label={cat.name}
                      slug={cat.slug}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </section>
  );
};

export default Categories;
