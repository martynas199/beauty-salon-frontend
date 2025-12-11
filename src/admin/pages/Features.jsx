import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAdmin } from "../../features/auth/authSlice";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { api } from "../../lib/apiClient";

// Icon components
const CrownIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2L12.5 7L18 8L14 12L15 18L10 15L5 18L6 12L2 8L7.5 7L10 2Z" />
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const TimesIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
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
);

export default function Features() {
  const navigate = useNavigate();
  const admin = useSelector(selectAdmin);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [featureStatus, setFeatureStatus] = useState(null);
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [discountProcessing, setDiscountProcessing] = useState(false);
  const [promotionStatus, setPromotionStatus] = useState(null);

  const beauticianId = admin?.beauticianId;

  useEffect(() => {
    if (beauticianId) {
      fetchFeatureStatus();
    } else {
      setLoading(false);
    }
    fetchPromotionStatus();
  }, [beauticianId]);

  const fetchFeatureStatus = async () => {
    try {
      setLoading(true);
      // Get feature status
      const statusRes = await api.get(`/features/${beauticianId}`);
      setFeatureStatus(statusRes.data);
    } catch (error) {
      console.error("Error fetching feature status:", error);
      toast.error("Failed to load feature status");
    } finally {
      setLoading(false);
    }
  };

  const fetchPromotionStatus = async () => {
    try {
      const res = await api.get("/promotions/status");
      setPromotionStatus(res.data);
    } catch (error) {
      console.error("Error fetching promotion status:", error);
    }
  };

  const handleApplyDiscount = async () => {
    const percentage = parseFloat(discountPercentage);
    
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      toast.error("Please enter a valid percentage between 0 and 100");
      return;
    }

    if (!window.confirm(`Apply ${percentage}% discount to all products?`)) {
      return;
    }

    try {
      setDiscountProcessing(true);
      const res = await api.post("/promotions/apply-discount", { percentage });
      toast.success(res.data.message);
      setDiscountPercentage("");
      await fetchPromotionStatus();
    } catch (error) {
      console.error("Error applying discount:", error);
      toast.error(error.response?.data?.error || "Failed to apply discount");
    } finally {
      setDiscountProcessing(false);
    }
  };

  const handleRemoveDiscount = async () => {
    if (!window.confirm("Remove all product discounts and restore original prices?")) {
      return;
    }

    try {
      setDiscountProcessing(true);
      const res = await api.post("/promotions/remove-discount");
      toast.success(res.data.message);
      await fetchPromotionStatus();
    } catch (error) {
      console.error("Error removing discount:", error);
      toast.error(error.response?.data?.error || "Failed to remove discount");
    } finally {
      setDiscountProcessing(false);
    }
  };

  const handleSubscribe = async () => {
    if (!beauticianId) return;
    try {
      setProcessing(true);
      const res = await api.post(`/features/${beauticianId}/subscribe-no-fee`);
      if (res.data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = res.data.checkoutUrl;
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast.error(
        error.response?.data?.error || "Failed to start subscription"
      );
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!beauticianId) return;
    if (
      !window.confirm(
        "Are you sure you want to cancel your subscription? It will remain active until the end of the current billing period."
      )
    ) {
      return;
    }

    try {
      setProcessing(true);
      await api.post(`/features/${beauticianId}/cancel-no-fee`);
      toast.success(
        "Subscription cancelled. It will remain active until the end of your billing period."
      );
      fetchFeatureStatus();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error(
        error.response?.data?.error || "Failed to cancel subscription"
      );
    } finally {
      setProcessing(false);
    }
  };

  if (!beauticianId) {
    return (
      <div className="max-w-4xl mx-auto py-4 sm:py-8 px-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Admin Account Not Linked
          </h2>
          <p className="text-sm sm:text-base text-gray-700 mb-4">
            Your admin account is not linked to a beautician profile. Premium
            features are only available for beautician accounts.
          </p>
          <button
            onClick={() => navigate("/admin/admin-links")}
            className="w-full sm:w-auto bg-brand-500 text-gray-900 py-2 px-4 rounded-lg text-sm sm:text-base font-semibold hover:bg-brand-600 transition-all"
          >
            Go to Admin-Beautician Links
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-4 sm:py-8 px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Loading features...
          </p>
        </div>
      </div>
    );
  }

  const isActive =
    featureStatus?.noFeeBookings?.enabled &&
    featureStatus?.noFeeBookings?.status === "active";
  const isCanceled = featureStatus?.noFeeBookings?.status === "canceled";

  // Check if period end has already passed (immediate cancellation)
  const periodEnd = featureStatus?.noFeeBookings?.currentPeriodEnd;
  const hasExpired = periodEnd && new Date(periodEnd) <= new Date();
  const isFullyCanceled = isCanceled && hasExpired;

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Premium Features
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Enhance your business with premium features
          </p>
        </div>

        {/* No Fee Bookings Feature Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-brand-200">
          <div className="bg-brand-500 p-4 sm:p-6 text-gray-900">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <CrownIcon className="w-6 h-6 sm:w-8 sm:h-8" />
              <h2 className="text-xl sm:text-2xl font-bold">No Fee Bookings</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-800">
              Remove the £1.00 booking fee for all your clients
            </p>
          </div>

          <div className="p-4 sm:p-6">
            {/* Current Status */}
            {isActive && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-brand-50 border border-brand-300 rounded-lg">
                <div className="flex items-center gap-2 text-brand-900 font-semibold mb-2 text-sm sm:text-base">
                  <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>Active Subscription</span>
                </div>
                <p className="text-xs sm:text-sm text-brand-800">
                  Your clients can book without paying the £1.00 booking fee!
                </p>
                {featureStatus?.noFeeBookings?.currentPeriodEnd && (
                  <p className="text-xs sm:text-sm text-brand-700 mt-2">
                    Next billing date:{" "}
                    {new Date(
                      featureStatus.noFeeBookings.currentPeriodEnd
                    ).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            )}

            {isCanceled && !hasExpired && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-800 font-semibold mb-2 text-sm sm:text-base">
                  <TimesIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>Subscription Cancelling</span>
                </div>
                <p className="text-xs sm:text-sm text-orange-700">
                  Your subscription will end on{" "}
                  {featureStatus?.noFeeBookings?.currentPeriodEnd &&
                    new Date(
                      featureStatus.noFeeBookings.currentPeriodEnd
                    ).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                </p>
              </div>
            )}

            {isFullyCanceled && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-100 border border-gray-300 rounded-lg">
                <div className="flex items-center gap-2 text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                  <TimesIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>Subscription Canceled</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Your subscription has ended. You can resubscribe at any time.
                </p>
              </div>
            )}

            {!isActive && !isCanceled && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm sm:text-base text-gray-700">
                  Currently, your clients pay a £1.00 booking fee when making
                  appointments.
                </p>
              </div>
            )}

            {/* Benefits */}
            <div className="mb-4 sm:mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                Benefits Include:
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckIcon className="text-brand-600 mt-0.5 sm:mt-1 w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700">
                    <strong>No £1.00 booking fee</strong> for your clients
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="text-brand-600 mt-0.5 sm:mt-1 w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700">
                    <strong>Increase bookings</strong> by removing barriers
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="text-brand-600 mt-0.5 sm:mt-1 w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700">
                    <strong>Better client experience</strong> with seamless
                    booking
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="text-brand-600 mt-0.5 sm:mt-1 w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700">
                    <strong>Professional image</strong> for your business
                  </span>
                </li>
              </ul>
            </div>

            {/* Pricing */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-brand-50 rounded-lg border border-brand-300">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                  £9.99
                  <span className="text-base sm:text-lg text-gray-600 font-normal">
                    /month
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Cancel anytime, no long-term commitment
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {!isActive && !isCanceled && (
                <button
                  onClick={handleSubscribe}
                  disabled={processing}
                  className="w-full sm:flex-1 bg-brand-500 text-gray-900 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-semibold hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? "Processing..." : "Subscribe Now"}
                </button>
              )}

              {isFullyCanceled && (
                <button
                  onClick={handleSubscribe}
                  disabled={processing}
                  className="w-full sm:flex-1 bg-brand-500 text-gray-900 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-semibold hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? "Processing..." : "Resubscribe"}
                </button>
              )}

              {isActive && (
                <button
                  onClick={handleCancel}
                  disabled={processing}
                  className="w-full sm:flex-1 bg-gray-200 text-gray-700 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? "Processing..." : "Cancel Subscription"}
                </button>
              )}

              {isCanceled && (
                <button
                  onClick={handleSubscribe}
                  disabled={processing}
                  className="w-full sm:flex-1 bg-brand-500 text-gray-900 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-semibold hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? "Processing..." : "Reactivate Subscription"}
                </button>
              )}
            </div>

            {/* Additional Info */}
            <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-600">
              <p>
                <strong>Note:</strong> Subscriptions are billed monthly via
                Stripe. You can cancel at any time and your subscription will
                remain active until the end of the current billing period.
              </p>
            </div>
          </div>
        </div>

        {/* Product Promotional Discounts */}
        <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Product Promotions
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  Apply percentage discounts to all products
                </p>
              </div>
            </div>

            {/* Current Status */}
            {promotionStatus?.hasActiveDiscount && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm sm:text-base text-purple-800 font-semibold">
                  ✨ Active Promotion
                </p>
                <p className="text-xs sm:text-sm text-purple-700 mt-1">
                  {promotionStatus.productsWithDiscount} of{" "}
                  {promotionStatus.totalProducts} products have discounted prices
                </p>
              </div>
            )}

            {!promotionStatus?.hasActiveDiscount && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm sm:text-base text-gray-700">
                  No active promotions. Enter a discount percentage below to apply a
                  sale to all products.
                </p>
              </div>
            )}

            {/* Discount Input */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Percentage
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    placeholder="e.g., 20"
                    disabled={discountProcessing}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    %
                  </span>
                </div>
                <button
                  onClick={handleApplyDiscount}
                  disabled={discountProcessing || !discountPercentage}
                  className="bg-purple-600 text-white px-4 sm:px-6 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {discountProcessing ? "Applying..." : "Apply"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter a value between 0 and 100 to discount all product prices
              </p>
            </div>

            {/* Remove Discount Button */}
            {promotionStatus?.hasActiveDiscount && (
              <button
                onClick={handleRemoveDiscount}
                disabled={discountProcessing}
                className="w-full bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {discountProcessing ? "Removing..." : "Remove All Discounts"}
              </button>
            )}

            {/* Info Box */}
            <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-600">
              <p>
                <strong>How it works:</strong> The discount is applied to all active
                products. Original prices are preserved so you can easily restore
                them later. Discounts are applied immediately to all product variants.
              </p>
            </div>
          </div>
        </div>

        {/* Future Features Placeholder */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
            More Features Coming Soon
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm">
            We're constantly working on new features to help grow your business.
            Stay tuned for updates!
          </p>
        </div>
      </motion.div>
    </div>
  );
}
