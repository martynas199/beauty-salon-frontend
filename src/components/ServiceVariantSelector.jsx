import { useState } from "react";
import Card from "./ui/Card";

export default function ServiceVariantSelector({
  service,
  onVariantSelect,
  onCancel,
  selectedBeautician,
}) {
  const [selectedVariant, setSelectedVariant] = useState(null);

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  const handleConfirm = () => {
    if (selectedVariant && onVariantSelect) {
      onVariantSelect(selectedVariant, service);
    } else if (!service.variants?.length) {
      const fallbackVariant = {
        name: "Standard Service",
        price: service.price,
        durationMin: service.durationMin,
        bufferBeforeMin: 0,
        bufferAfterMin: 10,
      };
      onVariantSelect(fallbackVariant, service);
    }
  };

  const imageUrl = service.image?.url || service.imageUrl;
  const imageAlt = service.image?.alt || service.name;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto overflow-x-hidden"
      onClick={onCancel}
    >
      <div
        className="bg-white sm:rounded-xl shadow-2xl max-w-2xl w-full h-full sm:h-auto max-h-full sm:max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 sm:p-6 border-b border-gray-200 overflow-x-hidden">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0 overflow-x-hidden">
              <div className="flex items-center gap-2 sm:gap-4 mb-1 sm:mb-2">
                {imageUrl && (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt={imageAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 overflow-x-hidden">
                  <h2 className="text-base sm:text-2xl font-serif font-bold text-gray-900 mb-0.5 sm:mb-1 truncate">
                    {service.name}
                  </h2>
                  {service.category && (
                    <div className="text-brand-600 text-xs sm:text-sm font-medium uppercase tracking-wide truncate">
                      {service.category}
                    </div>
                  )}
                </div>
              </div>

              {selectedBeautician && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 overflow-x-hidden">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                    {selectedBeautician.image?.url ? (
                      <img
                        src={selectedBeautician.image.url}
                        alt={selectedBeautician.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="truncate">
                    with {selectedBeautician.name}
                  </span>
                </div>
              )}

              {service.description && (
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
                  {service.description}
                </p>
              )}
            </div>

            <button
              onClick={onCancel}
              className="ml-2 sm:ml-4 p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-2 sm:p-6 pb-2 sm:pb-8 overflow-x-hidden flex flex-col flex-1">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">
            Choose Service Option
          </h3>

          {service.variants && service.variants.length > 0 ? (
            <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 mb-2 sm:mb-6 pr-1 sm:pr-2 custom-scrollbar overflow-x-hidden">
              {service.variants.map((variant, index) => (
                <Card
                  key={variant.name || index}
                  hoverable
                  className={`cursor-pointer border-2 transition-all duration-200 ${
                    selectedVariant?.name === variant.name
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200 hover:border-brand-300"
                  }`}
                  onClick={() => handleVariantSelect(variant)}
                >
                  <div className="p-2 sm:p-4 overflow-x-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {variant.name && (
                          <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 truncate">
                            {variant.name}
                          </h4>
                        )}

                        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 flex-wrap">
                          {variant.durationMin && (
                            <div className="flex items-center gap-1">
                              <svg
                                className="w-4 h-4 text-brand-600"
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
                              <span>{variant.durationMin} minutes</span>
                            </div>
                          )}

                          {variant.bufferBeforeMin > 0 && (
                            <div className="text-xs text-gray-500">
                              +{variant.bufferBeforeMin}min prep
                            </div>
                          )}

                          {variant.bufferAfterMin > 0 && (
                            <div className="text-xs text-gray-500">
                              +{variant.bufferAfterMin}min cleanup
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        {variant.price && (
                          <div className="text-right">
                            <div className="text-lg sm:text-2xl font-bold text-brand-700">
                              £{Number(variant.price).toFixed(2)}
                            </div>
                          </div>
                        )}

                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedVariant?.name === variant.name
                              ? "border-brand-500 bg-brand-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedVariant?.name === variant.name && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                No service options configured. Using standard service.
              </p>
              <Card className="border-2 border-brand-300 bg-brand-50">
                <div className="p-4 text-center">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Standard Service
                  </h4>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                    {service.durationMin && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4 text-brand-600"
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
                        <span>{service.durationMin} minutes</span>
                      </div>
                    )}
                    {service.price && (
                      <div className="text-xl font-bold text-brand-700">
                        £{Number(service.price).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        <div className="p-2 sm:p-6 border-t border-gray-200 bg-gray-50 overflow-x-hidden flex-shrink-0">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <button
              onClick={onCancel}
              className="px-3 sm:px-6 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirm}
              disabled={!selectedVariant && service.variants?.length > 0}
              className={
                selectedVariant || !service.variants?.length
                  ? "px-4 sm:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 whitespace-nowrap bg-brand-600 hover:bg-brand-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                  : "px-4 sm:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 whitespace-nowrap bg-gray-300 text-gray-500 cursor-not-allowed"
              }
            >
              <span className="hidden sm:inline">
                {selectedVariant || !service.variants?.length
                  ? "Continue to Time Selection"
                  : "Please select an option"}
              </span>
              <span className="sm:hidden">
                {selectedVariant || !service.variants?.length
                  ? "Continue"
                  : "Select option"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
