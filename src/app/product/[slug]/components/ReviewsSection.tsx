import { Star } from "lucide-react";

interface Props {
  rating: number;
  reviewCount: number;
}

export default function ReviewsSection({ rating, reviewCount }: Props) {
  return (
    <div className="py-10 sm:py-16 border-t border-border">
      <h2 className="text-center text-lg sm:text-xl font-bold mb-8 sm:mb-10">
        Reseñas de Clientes
      </h2>

      <div className="flex flex-col md:flex-row gap-8 sm:gap-10 max-w-4xl mx-auto">
        <div className="flex-1 flex flex-col items-center justify-center md:border-r border-border md:pr-8">
          <div className="flex text-[#c19a6b] mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            ))}
          </div>
          <p className="text-sm font-medium mb-1">{rating}.00 de 5</p>
          <p className="text-xs text-muted-foreground mb-4 sm:mb-6">
            Basado en {reviewCount} reseña
          </p>

          <div className="w-full max-w-xs space-y-1">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2 text-xs">
                <div className="flex text-[#c19a6b] w-16 sm:w-20 shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                        i < star ? "fill-current" : "text-gray-300 fill-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex-1 h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black"
                    style={{ width: star === rating ? "100%" : "0%" }}
                  />
                </div>
                <span className="w-4 text-right">{star === rating ? reviewCount : 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center md:pl-8">
          <button className="bg-black text-white px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase hover:opacity-80 transition-opacity">
            Escribir una reseña
          </button>
        </div>
      </div>
    </div>
  );
}
