import { useCurrency } from "../../contexts/CurrencyContext";

export default function ProductCard({ product, onClick }) {
  const { formatPrice } = useCurrency();
  // Check if product has variants
  const hasVariants = product.variants && product.variants.length > 0;

  // Calculate price display based on variants
  let displayPrice, displayOriginalPrice, hasDiscount, showPriceRange;

  if (hasVariants) {
    const prices = product.variants.map((v) => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    showPriceRange = prices.length > 1 && minPrice !== maxPrice;

    displayPrice = showPriceRange ? minPrice : product.variants[0].price;

    // Check if any variant has a discount
    const variantsWithDiscount = product.variants.filter(
      (v) => v.originalPrice && v.originalPrice > v.price
    );
    hasDiscount = variantsWithDiscount.length > 0;

    if (hasDiscount && !showPriceRange) {
      displayOriginalPrice = product.variants[0].originalPrice;
    }
  } else {
    // Fallback to legacy fields
    displayPrice = product.price;
    displayOriginalPrice = product.originalPrice;
    hasDiscount =
      product.originalPrice && product.originalPrice > product.price;
    showPriceRange = false;
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-250 cursor-pointer group"
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {product.image?.url ? (
          <img
            src={product.image.url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            SALE
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-base font-serif font-semibold text-gray-900 mb-2 line-clamp-2 tracking-wide">
          {product.title}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold" style={{ color: "#76540E" }}>
            {showPriceRange && "from "}
            {formatPrice(displayPrice)}
          </span>
          {hasDiscount && !showPriceRange && displayOriginalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(displayOriginalPrice)}
            </span>
          )}
        </div>

        {/* Sizes available */}
        {hasVariants && product.variants.length > 1 && (
          <p className="text-xs text-gray-500 mt-1">
            {product.variants.length} sizes available
          </p>
        )}
        {hasVariants &&
          product.variants.length === 1 &&
          product.variants[0].size && (
            <p className="text-xs text-gray-500 mt-1">
              {product.variants[0].size}
            </p>
          )}
        {!hasVariants && product.size && (
          <p className="text-xs text-gray-500 mt-1">{product.size}</p>
        )}
      </div>
    </div>
  );
}
