import { Star } from "lucide-react";
import type { ReviewsData } from "../types/types";

interface Props {
  data: ReviewsData;
}

export function ReviewsCard({ data }: Props) {
  const hasReviews = data.newReviews > 0;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2 mb-4">
        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#C19A6B]" />
        Reseñas del Período
      </h3>

      {!hasReviews ? (
        <div className="flex items-center justify-center h-20 text-gray-400">
          <p className="text-sm">Sin reseñas en este período</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <p className="text-3xl font-black text-gray-900">{data.avgRating}</p>
              <div className="flex gap-0.5 justify-center mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3 h-3 ${s <= Math.round(data.avgRating) ? "fill-[#C19A6B] text-[#C19A6B]" : "text-gray-200"}`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">{data.newReviews} reseñas</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {data.distribution.map((d) => (
                <div key={d.stars} className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-500 w-4 text-right">{d.stars}</span>
                  <Star className="w-2.5 h-2.5 text-gray-300 shrink-0" />
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-[#C19A6B] transition-all duration-700"
                      style={{ width: data.newReviews > 0 ? `${(d.count / data.newReviews) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 w-4">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
