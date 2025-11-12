import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { ProductsAPI } from "./products.api";
import { useCurrency } from "../../contexts/CurrencyContext";
import ProductDetailModal from "./ProductDetailModal";
import { motion } from "framer-motion";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function ProductCarousel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { formatPrice } = useCurrency();
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
              // Calculate price display (same logic as ProductCard)
              const hasVariants =
                product.variants && product.variants.length > 0;
              let displayPrice;
              let showPriceRange = false;
              let hasDiscount = false;
              let displayOriginalPrice;

              if (hasVariants) {
                const prices = product.variants.map((v) => v.price);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                showPriceRange = prices.length > 1 && minPrice !== maxPrice;
                displayPrice = showPriceRange
                  ? minPrice
                  : product.variants[0].price;

                // Check for discounts in variants
                const firstVariantWithDiscount = product.variants.find(
                  (v) => v.originalPrice && v.originalPrice > v.price
                );
                if (firstVariantWithDiscount && !showPriceRange) {
                  hasDiscount = true;
                  displayOriginalPrice = firstVariantWithDiscount.originalPrice;
                }
              } else {
                displayPrice = product.price;
                hasDiscount =
                  product.originalPrice &&
                  product.originalPrice > product.price;
                displayOriginalPrice = product.originalPrice;
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
      <style jsx>{`
        .product-carousel :global(.swiper-button-next),
        .product-carousel :global(.swiper-button-prev) {
          width: 48px;
          height: 48px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
        }

        .product-carousel :global(.swiper-button-next:hover),
        .product-carousel :global(.swiper-button-prev:hover) {
          background: #d4a373;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
        }

        .product-carousel :global(.swiper-button-next::after),
        .product-carousel :global(.swiper-button-prev::after) {
          font-size: 20px;
          font-weight: bold;
          color: #1f2937;
        }

        .product-carousel :global(.swiper-button-next:hover::after),
        .product-carousel :global(.swiper-button-prev:hover::after) {
          color: white;
        }

        .product-carousel :global(.swiper-pagination-bullet) {
          width: 12px;
          height: 12px;
          background: #d1d5db;
          opacity: 1;
          transition: all 0.3s;
        }

        .product-carousel :global(.swiper-pagination-bullet-active) {
          background: #d4a373;
          width: 32px;
          border-radius: 6px;
        }

        .product-carousel :global(.swiper-pagination) {
          bottom: -40px !important;
        }
      `}</style>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
