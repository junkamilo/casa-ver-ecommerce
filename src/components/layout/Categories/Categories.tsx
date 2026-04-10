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
    <section className="relative w-full py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 bg-[#FAFAFA] border-t border-[#C19A6B]/10 overflow-hidden">

      <div className="relative max-w-7xl 2xl:max-w-6xl mx-auto z-10">

        <SectionHeader
          title={SECTION_CONFIG.title}
          titleItalic={SECTION_CONFIG.titleItalic}
          href={SECTION_CONFIG.href}
          linkText={SECTION_CONFIG.linkText}
          textColor={SECTION_CONFIG.textColor}
          hoverColor={SECTION_CONFIG.hoverColor}
          fontClass={SECTION_CONFIG.fontClass}
        />

        <div className="relative group/carousel mt-8 sm:mt-10 md:mt-12">

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
                className="grid grid-flow-col auto-cols-[80vw] sm:auto-cols-[50vw] gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-4 sm:pb-6 snap-x snap-mandatory md:grid-flow-row md:auto-cols-auto md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 md:gap-6 md:overflow-visible md:pb-0 md:snap-none"
                style={{ scrollBehavior: "smooth" }}
              >
                {categories.map((cat) => (
                  <div key={cat.id} className="snap-center md:snap-none">
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
