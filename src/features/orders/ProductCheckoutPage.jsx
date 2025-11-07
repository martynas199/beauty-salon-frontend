import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { OrdersAPI } from "./orders.api";
import { ProductsAPI } from "../products/products.api";
import { clearCart } from "../cart/cartSlice";
import Button from "../../components/ui/Button";
import { useAuth } from "../../app/AuthContext";

export default function ProductCheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const cartItems = useSelector((state) => state.cart.items);

  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [products, setProducts] = useState({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "United Kingdom",
    notes: "",
  });

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (user) {
      const nameParts = user.name ? user.name.split(" ") : ["", ""];
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      setFormData((prev) => ({
        ...prev,
        firstName,
        lastName,
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  // Load product details when component mounts
  useEffect(() => {
    if (cartItems.length > 0) {
      loadProductDetails();
    }
  }, [cartItems]);

  const loadProductDetails = async () => {
    setLoadingProducts(true);
    try {
      const productMap = {};
      for (const item of cartItems) {
        if (!productMap[item.productId]) {
          const product = await ProductsAPI.get(item.productId);
          productMap[item.productId] = product;
        }
      }
      setProducts(productMap);
    } catch (error) {
      console.error("Error loading product details:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Calculate order totals
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare order items
      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
      }));

      // Create Stripe checkout session
      const response = await OrdersAPI.createCheckout({
        items: orderItems,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        notes: formData.notes,
        ...(user ? { userId: user._id } : {}), // Add userId if logged in
      });

      // Clear cart before redirecting to Stripe
      dispatch(clearCart());

      // Redirect to Stripe Checkout
      window.location.href = response.url;
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error(
        error.response?.data?.error ||
          "Failed to create checkout session. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <svg
            className="w-24 h-24 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some products to your cart before checking out
          </p>
          <Button onClick={() => navigate("/")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 overflow-x-hidden">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-8 break-words">
        Checkout
      </h1>

      <form onSubmit={handleSubmit} className="overflow-x-hidden">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Left: Shipping Form */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 overflow-hidden">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 break-words">
                  Shipping Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      placeholder="John"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      placeholder="Doe"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      autoComplete="tel"
                      inputMode="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      placeholder="+44 7700 900000"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Address *
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="street-address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      placeholder="123 Main Street, Apt 4B"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="address-level2"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      placeholder="London"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="postal-code"
                      value={formData.postalCode}
                      onChange={(e) =>
                        setFormData({ ...formData, postalCode: e.target.value })
                      }
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      placeholder="SW1A 1AA"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Country *
                    </label>
                    <select
                      required
                      autoComplete="country-name"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none bg-white"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: "right 0.5rem center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "1.5em 1.5em",
                        paddingRight: "2.5rem",
                      }}
                    >
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Ireland">Ireland</option>
                      <option value="France">France</option>
                      <option value="Germany">Germany</option>
                      <option value="Spain">Spain</option>
                      <option value="Italy">Italy</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                      placeholder="Special delivery instructions..."
                    />
                  </div>
                </div>

                {/* Sign-in prompt for guests */}
                {!user && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">ℹ️</span>
                      <div>
                        <span className="text-gray-700">
                          <Link
                            to="/login"
                            state={{ from: location.pathname }}
                            className="text-brand-600 hover:text-brand-700 font-medium underline"
                          >
                            Sign in
                          </Link>{" "}
                          or{" "}
                          <Link
                            to="/register"
                            state={{ from: location.pathname }}
                            className="text-brand-600 hover:text-brand-700 font-medium underline"
                          >
                            create an account
                          </Link>{" "}
                          to track your orders and easily reorder in the future.
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Place Order Button - Mobile (Sticky at bottom) */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10 shadow-lg">
                <Button
                  type="submit"
                  variant="brand"
                  size="lg"
                  loading={loading}
                  disabled={loading}
                  className="w-full py-4 text-lg"
                >
                  {loading
                    ? "Processing..."
                    : `Place Order • £${total.toFixed(2)}`}
                </Button>
              </div>

              {/* Spacer for mobile button */}
              <div className="lg:hidden h-20"></div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1 order-first lg:order-last mb-4 lg:mb-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-8 overflow-hidden">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 break-words">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-4 sm:mb-6 max-h-60 sm:max-h-80 overflow-y-auto overflow-x-hidden">
                {cartItems.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="flex gap-3"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.product?.image?.url || item.product?.image ? (
                        <img
                          src={item.product.image?.url || item.product.image}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg
                            className="w-8 h-8"
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
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 break-words line-clamp-2">
                        {item.product?.title}
                      </h3>
                      {item.product?.size && (
                        <p className="text-xs text-gray-500 break-words">
                          {item.product.size}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900">
                        £
                        {((item.product?.price || 0) * item.quantity).toFixed(
                          2
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `£${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900">
                      Total
                    </span>
                    <span
                      className="text-xl font-bold"
                      style={{ color: "#76540E" }}
                    >
                      £{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Free Shipping Message */}
              {subtotal < 50 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Add £{(50 - subtotal).toFixed(2)} more for free shipping
                  </p>
                </div>
              )}

              {/* Place Order Button - Desktop */}
              <div className="hidden lg:block mt-6">
                <Button
                  type="submit"
                  variant="brand"
                  size="lg"
                  loading={loading}
                  disabled={loading}
                  className="w-full"
                >
                  Place Order • £{total.toFixed(2)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
