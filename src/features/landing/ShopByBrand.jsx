import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/apiClient";

export default function ShopByBrand() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const response = await api.get("/products");
      const products = response.data || [];

      // Extract unique brands with product counts
      const brandMap = {};
      products.forEach((product) => {
        if (product.brand && product.brand.trim() !== "") {
          if (!brandMap[product.brand]) {
            brandMap[product.brand] = {
              name: product.brand,
              count: 0,
              image: product.image?.url || null,
            };
          }
          brandMap[product.brand].count++;
          // Use first product image if brand doesn't have one yet
          if (!brandMap[product.brand].image && product.image?.url) {
            brandMap[product.brand].image = product.image.url;
          }
        }
      });

      // Convert to array and sort by count (most popular first)
      const brandsArray = Object.values(brandMap).sort(
        (a, b) => b.count - a.count
      );
      setBrands(brandsArray);
    } catch (error) {
      console.error("Failed to load brands:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBrandClick = (brandName) => {
    // Navigate to products page with brand pre-selected
    navigate(`/products?brand=${encodeURIComponent(brandName)}`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-200 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (brands.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6"
    >
      {brands.map((brand, index) => (
        <motion.button
          key={brand.name}
          onClick={() => handleBrandClick(brand.name)}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="group relative aspect-square bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
        >
          {/* Background Image with Overlay */}
          {brand.image && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                style={{ backgroundImage: `url(${brand.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/80 to-white/70" />
            </>
          )}

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center p-4 sm:p-6">
            {/* Brand Name */}
            <h3 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-gray-900 mb-2 text-center group-hover:text-brand-700 transition-colors">
              {brand.name}
            </h3>

            {/* Product Count */}
            <p className="text-xs sm:text-sm text-gray-600 font-light">
              {brand.count} {brand.count === 1 ? "Product" : "Products"}
            </p>

            {/* Hover Arrow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute bottom-3 sm:bottom-4 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600"
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
            </motion.div>
          </div>

          {/* Decorative Corner Element */}
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 opacity-10 group-hover:opacity-20 transition-opacity">
            <div className="absolute top-0 right-0 w-full h-full bg-brand-400 rounded-bl-full" />
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}
