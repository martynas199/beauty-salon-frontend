import { useEffect, useState, useRef } from "react";
import { ProductsAPI } from "./products.api";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal";
import { ProductCardSkeleton } from "../../components/ui/Skeleton";
import { motion } from "framer-motion";

export default function PopularCollections() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const sectionRef = useRef(null);

  useEffect(() => {
    ProductsAPI.list({ featured: true, active: true })
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-12">
        <h2 className="text-3xl md:text-4xl font-script font-bold text-center mb-12 uppercase tracking-wide text-brand-900">
          Featured products
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div ref={sectionRef} className="py-12">
      {/* Section Title */}
      <h2 className="text-3xl md:text-4xl font-script font-bold text-center mb-12 uppercase tracking-wide text-brand-900">
        Featured products
      </h2>

      {/* Products Grid */}
      <motion.div
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 overflow-hidden"
      >
        {products.map((product) => (
          <motion.div
            key={product._id}
            variants={{
              hidden: { opacity: 0, y: 60 },
              show: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 1.6,
                  ease: "easeOut",
                },
              },
            }}
          >
            <ProductCard
              product={product}
              onClick={() => setSelectedProduct(product)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
