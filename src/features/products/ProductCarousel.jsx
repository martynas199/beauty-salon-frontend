import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { ProductsAPI } from "./products.api";
import { useCurrency } from "../../contexts/CurrencyContext";
import { motion } from "framer-motion";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Lazy load ProductDetailModal (only loads when user clicks a product)
const ProductDetailModal = lazy(() => import("./ProductDetailModal"));

export default function ProductCarousel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { formatPrice, currency } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await ProductsAPI.list({ active: true });
        const productList = Array.isArray(data) ? data : [];
        setProducts(productList.slice(0, 12));
      } catch (error) {
        console.error("Failed to load products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-white via-gray-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-2xl h-96 animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!products.length) {
    return null;
  }

  return (
    <>
      <div className="bg-gradient-to-b from-white via-gray-50 to-white py-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3">
              Discover Our Products
            </h2>
            <p className="text-gray-600 text-lg">
              Explore our curated collection of beauty essentials
            </p>
          </motion.div>

          {/* Swiper Carousel */}
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            speed={800}
            navigation={true}
            pagination={{ clickable: true }}
            breakpoints={{
              640: {
                slidesPerView: 1,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              1280: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
            }}
            className="product-carousel"
          >
            {products.map((product) => {
              // Calculate price display with currency awareness
              const hasVariants =
                product.variants && product.variants.length > 0;
              let displayPrice;
              let showPriceRange = false;
              let hasDiscount = false;
              let displayOriginalPrice;

              if (hasVariants) {
                // Get prices based on selected currency
                const prices = product.variants.map((v) =>
                  currency === "EUR" && v.priceEUR != null
                    ? v.priceEUR
                    : v.price
                );
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                showPriceRange = prices.length > 1 && minPrice !== maxPrice;
                displayPrice = showPriceRange
                  ? minPrice
                  : currency === "EUR" && product.variants[0].priceEUR != null
                  ? product.variants[0].priceEUR
                  : product.variants[0].price;

                // Check for discounts in variants
                const firstVariantWithDiscount = product.variants.find((v) => {
                  const variantPrice =
                    currency === "EUR" && v.priceEUR != null
                      ? v.priceEUR
                      : v.price;
                  const variantOriginalPrice =
                    currency === "EUR" && v.originalPriceEUR != null
                      ? v.originalPriceEUR
                      : v.originalPrice;
                  return (
                    variantOriginalPrice && variantOriginalPrice > variantPrice
                  );
                });

                if (firstVariantWithDiscount && !showPriceRange) {
                  hasDiscount = true;
                  displayOriginalPrice =
                    currency === "EUR" &&
                    firstVariantWithDiscount.originalPriceEUR != null
                      ? firstVariantWithDiscount.originalPriceEUR
                      : firstVariantWithDiscount.originalPrice;
                }
              } else {
                displayPrice =
                  currency === "EUR" && product.priceEUR != null
                    ? product.priceEUR
                    : product.price;

                const originalPrice =
                  currency === "EUR" && product.originalPriceEUR != null
                    ? product.originalPriceEUR
                    : product.originalPrice;

                hasDiscount = originalPrice && originalPrice > displayPrice;
                displayOriginalPrice = originalPrice;
              }

              return (
                <SwiperSlide key={product._id}>
                  <div
                    onClick={() => setSelectedProduct(product)}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group h-full flex flex-col"
                  >
                    {/* Image Section */}
                    <div className="relative h-64 bg-gray-100 overflow-hidden">
                      {product.image?.url ? (
                        <img
                          src={product.image.url}
                          alt={product.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                      {product.featured && (
                        <div className="absolute top-3 right-3 bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          Featured
                        </div>
                      )}
                      {hasDiscount && !showPriceRange && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          SALE
                        </div>
                      )}
                    </div>

                    {/* Info Section */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex-1">
                        {product.category && (
                          <p className="text-brand-600 text-sm font-medium mb-2">
                            {product.category}
                          </p>
                        )}
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {product.title}
                        </h3>
                        {product.description && (
                          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-auto">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {showPriceRange && "from "}
                            {formatPrice(displayPrice)}
                          </span>
                          {hasDiscount &&
                            !showPriceRange &&
                            displayOriginalPrice && (
                              <span className="text-sm text-gray-400 line-through">
                                {formatPrice(displayOriginalPrice)}
                              </span>
                            )}
                        </div>
                        {hasVariants && product.variants.length > 1 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {product.variants.length} sizes available
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mt-12"
          >
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-2 px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-full transition-colors duration-200"
            >
              View All Products
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Custom Styles for Swiper Navigation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .product-carousel {
          --swiper-navigation-color: #d4a710 !important;
          --swiper-theme-color: #d4a710 !important;
        }

        .product-carousel .swiper-button-next,
        .product-carousel .swiper-button-prev {
          width: 48px !important;
          height: 48px !important;
          background: transparent !important;
          border-radius: 50% !important;
          transition: all 0.3s !important;
          color: #d4a710 !important;
        }

        .product-carousel .swiper-button-next:hover,
        .product-carousel .swiper-button-prev:hover {
          background: rgba(212, 167, 16, 0.1) !important;
          transform: scale(1.1) !important;
          color: #b8910e !important;
        }

        .product-carousel .swiper-button-next::after,
        .product-carousel .swiper-button-prev::after {
          font-size: 24px !important;
          font-weight: 900 !important;
          color: #d4a710 !important;
        }

        .product-carousel .swiper-button-next:hover::after,
        .product-carousel .swiper-button-prev:hover::after {
          color: #b8910e !important;
        }

        .product-carousel .swiper-button-disabled {
          opacity: 0.3 !important;
        }

        .product-carousel .swiper-pagination-bullet {
          width: 12px !important;
          height: 12px !important;
          background: #d1d5db !important;
          opacity: 1 !important;
          transition: all 0.3s !important;
        }

        .product-carousel .swiper-pagination-bullet-active {
          background: #d4a710 !important;
          width: 32px !important;
          border-radius: 6px !important;
        }

        .product-carousel .swiper-pagination {
          bottom: -40px !important;
        }
      `,
        }}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <Suspense fallback={<div />}>
          <ProductDetailModal
            product={selectedProduct}
            isOpen={!!selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        </Suspense>
      )}
    </>
  );
}
