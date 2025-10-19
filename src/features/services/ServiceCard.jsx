﻿import Card from "../../components/ui/Card";

/**
 * ServiceCard - reusable card for displaying a service with image, name, category, description, and variants (price & duration)
 * @param {object} props
 * @param {object} props.service - The service object
 * @param {function} props.onClick - Click handler for the card
 */
export default function ServiceCard({ service, onClick }) {
  // Support both new image object and legacy imageUrl string
  const imageUrl = service.image?.url || service.imageUrl;
  const imageAlt = service.image?.alt || service.name;

  // Get price range for display
  const prices =
    service.variants?.map((v) => Number(v.price)).filter(Boolean) || [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

  return (
    <Card
      className="p-0 overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group border border-gray-200 hover:border-brand-300"
      onClick={onClick}
    >
      <div className="flex flex-row">
        {imageUrl && (
          <div className="relative w-20 sm:w-32 h-auto overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={imageUrl}
              alt={imageAlt}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {/* Gradient overlay for better aesthetics */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}
        <div className="flex flex-col flex-1 p-2.5 sm:p-4">
          <div className="flex flex-col gap-0.5 mb-1">
            <div className="font-bold text-sm sm:text-lg text-gray-900 leading-tight">
              {service.name}
            </div>
            {service.category && (
              <div className="text-brand-600 text-[9px] sm:text-xs font-medium uppercase tracking-wide">
                {service.category}
              </div>
            )}
            {(service.primaryBeauticianId?.name ||
              service.beautician?.name) && (
              <div className="text-[9px] sm:text-xs text-gray-500">
                By{" "}
                {service.primaryBeauticianId?.name || service.beautician?.name}
              </div>
            )}
          </div>
          {service.description && (
            <div className="text-gray-500 text-[11px] sm:text-sm mb-1.5 sm:mb-3 line-clamp-2">
              {service.description}
            </div>
          )}

          {/* Price and Action Section */}
          <div className="flex items-center justify-between mt-auto pt-1.5 sm:pt-2 border-t border-gray-100">
            {/* Price and Duration Display */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {minPrice !== null && (
                <div className="flex items-baseline gap-0.5 sm:gap-1">
                  <span className="text-[10px] sm:text-xs text-gray-500">
                    From
                  </span>
                  <span className="text-base sm:text-xl font-bold text-brand-700">
                    £{minPrice.toFixed(2)}
                  </span>
                  {maxPrice > minPrice && (
                    <span className="text-[10px] sm:text-xs text-gray-400">
                      - £{maxPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              )}
              {/* Duration */}
              {service.variants && service.variants.length > 0 && (
                <div className="flex items-center gap-0.5 sm:gap-1 text-gray-600 text-[9px] sm:text-xs">
                  <svg
                    className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 7v5l3 2"
                    />
                  </svg>
                  {(() => {
                    const durations = service.variants
                      .map((v) => v.durationMin)
                      .filter(Boolean);
                    const minDuration = Math.min(...durations);
                    const maxDuration = Math.max(...durations);
                    if (minDuration === maxDuration) {
                      return `${minDuration} min`;
                    }
                    return `${minDuration}-${maxDuration} min`;
                  })()}
                </div>
              )}
            </div>

            {/* Book Now Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
              className="px-3 sm:px-6 py-1.5 sm:py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-[11px] sm:text-sm font-semibold rounded-full shadow-md hover:shadow-lg transform group-hover:scale-105 transition-all duration-200 whitespace-nowrap"
            >
              Book Now
            </button>
          </div>

          {/* Variants - Hidden by default, can be shown on hover or click if needed */}
          {Array.isArray(service.variants) &&
            service.variants.length > 0 &&
            false && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-auto justify-end">
                {service.variants.map((v) => (
                  <span
                    key={v.name}
                    className="inline-flex items-center gap-2 sm:gap-3 bg-gray-50 border border-gray-200 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-gray-700 font-semibold shadow-sm hover:bg-brand-50 transition-colors whitespace-nowrap"
                  >
                    {v.price && (
                      <span className="flex items-center gap-0.5 text-brand-700 font-bold">
                        <span className="text-sm sm:text-base">{"\u00A3"}</span>
                        <span className="text-xs sm:text-sm">
                          {Number(v.price).toFixed(2)}
                        </span>
                      </span>
                    )}
                    {v.durationMin && (
                      <span className="flex items-center gap-0.5 sm:gap-1 text-gray-500">
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 text-brand-600"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 7v5l3 2"
                          />
                        </svg>
                        <span className="text-xs sm:text-sm">
                          {v.durationMin} min
                        </span>
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}
        </div>
      </div>
    </Card>
  );
}
