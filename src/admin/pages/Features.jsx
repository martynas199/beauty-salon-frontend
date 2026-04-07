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
  const [processingSms, setProcessingSms] = useState(false);
  const [featureStatus, setFeatureStatus] = useState(null);

  const beauticianId = admin?.beauticianId;

  useEffect(() => {
    if (beauticianId) {
      fetchFeatureStatus();
    } else {
      setLoading(false);
    }
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

  const handleSmsSubscribe = async () => {
    if (!beauticianId) return;
    try {
      setProcessingSms(true);
      const res = await api.post(`/features/${beauticianId}/subscribe-sms`);
      if (res.data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = res.data.checkoutUrl;
      }
    } catch (error) {
      console.error("Error creating SMS subscription:", error);
      toast.error(
        error.response?.data?.error || "Failed to start SMS subscription"
      );
      setProcessingSms(false);
    }
  };

  const handleCancelSms = async () => {
    if (!beauticianId) return;
    if (
      !window.confirm(
        "Are you sure you want to cancel your SMS subscription? It will remain active until the end of the current billing period."
      )
    ) {
      return;
    }

    try {
      setProcessingSms(true);
      await api.post(`/features/${beauticianId}/cancel-sms`);
      toast.success(
        "SMS subscription cancelled. It will remain active until the end of your billing period."
      );
      fetchFeatureStatus();
    } catch (error) {
      console.error("Error cancelling SMS subscription:", error);
      toast.error(
        error.response?.data?.error || "Failed to cancel SMS subscription"
      );
    } finally {
      setProcessingSms(false);
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

  const noFeeCancelAtPeriodEnd =
    featureStatus?.noFeeBookings?.cancelAtPeriodEnd === true;
  const isActive =
    featureStatus?.noFeeBookings?.enabled &&
    featureStatus?.noFeeBookings?.status === "active" &&
    !noFeeCancelAtPeriodEnd;
  const isCanceled =
    featureStatus?.noFeeBookings?.status === "canceled" ||
    noFeeCancelAtPeriodEnd;

  // Check if period end has already passed (immediate cancellation)
  const periodEnd = featureStatus?.noFeeBookings?.currentPeriodEnd;
  const hasExpired = periodEnd && new Date(periodEnd) <= new Date();
  const isFullyCanceled =
    featureStatus?.noFeeBookings?.status === "canceled" &&
    (periodEnd ? hasExpired : true);

  // SMS subscription status
  const smsCancelAtPeriodEnd =
    featureStatus?.smsConfirmations?.cancelAtPeriodEnd === true;
  const smsActive =
    featureStatus?.smsConfirmations?.enabled &&
    featureStatus?.smsConfirmations?.status === "active" &&
    !smsCancelAtPeriodEnd;
  const smsCanceled =
    featureStatus?.smsConfirmations?.status === "canceled" ||
    smsCancelAtPeriodEnd;
  const smsPeriodEnd = featureStatus?.smsConfirmations?.currentPeriodEnd;
  const smsHasExpired = smsPeriodEnd && new Date(smsPeriodEnd) <= new Date();
  const smsFullyCanceled =
    featureStatus?.smsConfirmations?.status === "canceled" &&
    (smsPeriodEnd ? smsHasExpired : true);

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Platform Subscription
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            This subscription is required for beauticians to use the platform
          </p>
        </div>

        {/* Platform Access Subscription Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-brand-200">
          <div className="bg-brand-500 p-4 sm:p-6 text-gray-900">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <CrownIcon className="w-6 h-6 sm:w-8 sm:h-8" />
              <h2 className="text-xl sm:text-2xl font-bold">Platform Access Subscription</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-800">
              Required to use the platform. Includes No Fee Bookings for your clients.
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
                  Platform access is active. Clients can book without paying the GBP 1.00 booking fee.
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

            {isCanceled && !isFullyCanceled && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-800 font-semibold mb-2 text-sm sm:text-base">
                  <TimesIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>Subscription Cancelling</span>
                </div>
                <p className="text-xs sm:text-sm text-orange-700">
                  {noFeeCancelAtPeriodEnd ? "Your platform access will end on " : "Your platform subscription is being canceled. "}
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
                  Your platform subscription has ended. Resubscribe to keep using the platform.
                </p>
              </div>
            )}

            {!isActive && !isCanceled && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm sm:text-base text-gray-700">
                  This subscription is required for platform access and keeps client bookings free from the GBP 1.00 booking fee.
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
                    <strong>Required platform access</strong> for beautician accounts
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="text-brand-600 mt-0.5 sm:mt-1 w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700">
                    <strong>No GBP 1.00 booking fee</strong> for your clients
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="text-brand-600 mt-0.5 sm:mt-1 w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700">
                    <strong>Uninterrupted bookings</strong> for your business
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="text-brand-600 mt-0.5 sm:mt-1 w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700">
                    <strong>Better client experience</strong> with fewer checkout barriers
                  </span>
                </li>
              </ul>
            </div>

            {/* Pricing */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-brand-50 rounded-lg border border-brand-300">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                  GBP 9.99
                  <span className="text-base sm:text-lg text-gray-600 font-normal">
                    /month
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Required plan for active platform access
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
                  {processing ? "Processing..." : "Activate Subscription"}
                </button>
              )}

              {isFullyCanceled && (
                <button
                  onClick={handleSubscribe}
                  disabled={processing}
                  className="w-full sm:flex-1 bg-brand-500 text-gray-900 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-semibold hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? "Processing..." : "Subscribe Again"}
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

              {isCanceled && !isFullyCanceled && (
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
                <strong>Note:</strong> This plan is billed monthly via Stripe and is required for beauticians to use the platform. The No Fee Bookings logic remains unchanged.
              </p>
            </div>
          </div>
        </div>

        {/* SMS Confirmations Feature Card */}
        <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-lg overflow-hidden border-2 border-brand-200">
          <div className="bg-brand-500 p-4 sm:p-6 text-gray-900">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <CrownIcon className="w-6 h-6 sm:w-8 sm:h-8" />
              <h2 className="text-xl sm:text-2xl font-bold">
                SMS Confirmations & Reminders
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-800">
              Send automatic SMS confirmations to clients when they book
            </p>
          </div>

          <div className="p-4 sm:p-6">
            {/* Current Status */}
            {smsActive && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-300 rounded-lg">
                <div className="flex items-center gap-2 text-green-900 font-semibold text-xs sm:text-sm mb-1">
                  <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Active Subscription</span>
                </div>
                <p className="text-xs sm:text-sm text-green-800">
                  Your clients will receive SMS confirmations when they book!
                </p>
                {smsPeriodEnd && (
                  <p className="text-xs text-green-700 mt-1">
                    Next billing:{" "}
                    {new Date(smsPeriodEnd).toLocaleDateString("en-GB")}
                  </p>
                )}
              </div>
            )}

            {smsCanceled && !smsFullyCanceled && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-amber-50 border border-amber-300 rounded-lg">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs sm:text-sm mb-1">
                  <span>Subscription Ending</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-800">
                  Your SMS subscription is canceled but active until{" "}
                  {smsPeriodEnd
                    ? new Date(smsPeriodEnd).toLocaleDateString("en-GB")
                    : "the end of the current billing period"}
                </p>
              </div>
            )}

            {smsFullyCanceled && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 border border-gray-300 rounded-lg">
                <div className="flex items-center gap-2 text-gray-900 font-semibold text-xs sm:text-sm mb-1">
                  <TimesIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Subscription Expired</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-700">
                  Your SMS subscription has ended. Resubscribe to continue
                  sending SMS confirmations.
                </p>
              </div>
            )}

            {/* Benefits List */}
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-gray-700">
                  Instant SMS confirmations when clients book appointments
                </span>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-gray-700">
                  Reduce no-shows with automated SMS reminders
                </span>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-gray-700">
                  Professional client communication via SMS
                </span>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-gray-700">
                  Works automatically - no setup required after subscription
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="mb-4 sm:mb-6">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                  £2.99
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
              {!smsActive && !smsCanceled && (
                <button
                  onClick={handleSmsSubscribe}
                  disabled={processingSms}
                  className="w-full sm:flex-1 bg-brand-500 text-gray-900 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-semibold hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingSms ? "Processing..." : "Subscribe Now"}
                </button>
              )}

              {smsFullyCanceled && (
                <button
                  onClick={handleSmsSubscribe}
                  disabled={processingSms}
                  className="w-full sm:flex-1 bg-brand-500 text-gray-900 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-semibold hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingSms ? "Processing..." : "Resubscribe"}
                </button>
              )}

              {smsActive && (
                <button
                  onClick={handleCancelSms}
                  disabled={processingSms}
                  className="w-full sm:flex-1 bg-gray-200 text-gray-700 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingSms ? "Processing..." : "Cancel Subscription"}
                </button>
              )}

              {smsCanceled && !smsFullyCanceled && (
                <button
                  onClick={handleSmsSubscribe}
                  disabled={processingSms}
                  className="w-full sm:flex-1 bg-brand-500 text-gray-900 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base font-semibold hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingSms ? "Processing..." : "Reactivate Subscription"}
                </button>
              )}
            </div>

            {/* Additional Info */}
            <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-600">
              <p>
                <strong>Note:</strong> SMS confirmations are sent automatically
                when clients book appointments. Cancel anytime with no
                commitment.
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


