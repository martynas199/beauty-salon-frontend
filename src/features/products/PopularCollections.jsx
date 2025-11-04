import { useEffect, useState, useRef } from "react";
import { ProductsAPI } from "./products.api";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal";
import {
  StaggerContainer,
  StaggerItem,
} from "../../components/ui/PageTransition";
import { ProductCardSkeleton } from "../../components/ui/Skeleton";

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
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <StaggerItem key={product._id}>
            <ProductCard
              product={product}
              onClick={() => setSelectedProduct(product)}
            />
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
